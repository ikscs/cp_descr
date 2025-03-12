import React from 'react';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import Tooltip, { TooltipProps } from '@mui/material/Tooltip';

interface IconButtonExtProps extends IconButtonProps {
  tooltipTitle?: string;
  tooltipPlacement?: TooltipProps['placement'];
}

const IconButtonExt: React.FC<IconButtonExtProps> = ({
  tooltipTitle,
  tooltipPlacement,
  ...rest
}) => {
  return (
    <Tooltip title={tooltipTitle} placement={tooltipPlacement}>
      <IconButton {...rest} />
    </Tooltip>
  );
};

export default IconButtonExt;