-- Function to create profile automatically when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a new profile with data from the signup metadata
  INSERT INTO public.profiles (id, email, full_name, user_type, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'user_type')::user_type, 'patient'),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  
  -- If user is a clinic, create clinic record
  IF (NEW.raw_user_meta_data->>'user_type') = 'clinic' THEN
    INSERT INTO public.clinics (profile_id, clinic_name, address, description)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'clinic_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'address', ''),
      COALESCE(NEW.raw_user_meta_data->>'description', '')
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
