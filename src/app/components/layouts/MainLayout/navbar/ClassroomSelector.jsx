import React from "react";
import { Stack, Select, MenuItem, Skeleton } from "@mui/material";

const ClassroomSelector = ({
  classroom = [],
  selectedClass,
  loadingClassroom = false,
  onChangeClassroom,
}) => {
  if (loadingClassroom) {
    return <Skeleton width={120} height={40} />;
  }

  return (
    <Stack direction="row" alignItems="center">
      <Select
        value={selectedClass}
        displayEmpty
        onChange={onChangeClassroom}
        size="small"
      >
        {classroom?.map((classItem) => (
          <MenuItem key={classItem.id} value={classItem.id}>
            {classItem.classroom_name}
          </MenuItem>
        ))}
      </Select>
    </Stack>
  );
};

export default ClassroomSelector;
