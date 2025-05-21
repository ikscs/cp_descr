import React from 'react';
import OriginList from './OriginList'; // Assuming OriginsList is now .tsx
import { Box, Typography } from '@mui/material';

// No specific props for OriginsView are defined in this version,
// but you could add them if needed (e.g., for passing a pointIdFilter).
// interface OriginsViewProps {
//   pointIdFilter?: number;
// }

const OriginView: React.FC = (/* props: OriginsViewProps */) => {
  // The state and handlers for modal visibility, editing state, and list refreshing
  // are now managed within OriginsList.tsx.

  // If you need to pass a filter to OriginsList, you can get it from props or context:
  // const { pointIdFilter } = props;

  return (
    <Box sx={{ p: 2, }}>
      <Typography variant="h5" gutterBottom>
        Управление источниками (Камерами, Регистраторами)
      </Typography>
      <OriginList pointIdFilter={-1}
        // If OriginsList needs to be filtered by a point ID controlled by OriginsView
        // or a parent component, you would pass it here:
        // pointIdFilter={pointIdFilter}
      />
      {/*
        The Modal and OriginsForm are no longer rendered directly by OriginsView.
        This logic has been moved into OriginsList.tsx to make it more self-contained,
        following the pattern of PointList.tsx and UserList.tsx.
      */}
    </Box>
  );
};

export default OriginView;
