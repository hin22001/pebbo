CREATE OR REPLACE FUNCTION get_student_dashboard_combined(_user_id uuid, _year int)
RETURNS json AS $$
DECLARE
  init_data json;
  class_data json;
BEGIN
  init_data := get_student_dashboard_init(_user_id);
  class_data := get_student_dashboard_classroom(_user_id, _year);
  RETURN init_data::jsonb || class_data::jsonb;
END;
$$ LANGUAGE plpgsql;
