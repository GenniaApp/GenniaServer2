import { Box, Slider, Typography } from '@mui/material';

interface SliderBoxProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  valueLabelDisplay?: any;
  marks?: { value: number; label: string }[];
  icon?: React.ReactNode;
  handleChange: any;
  disabled: boolean;
  restProps?: any;
}

export default function SliderBox({
  label,
  value,
  min = 0,
  max = 1,
  step = 0.01,
  valueLabelDisplay = 'on',
  marks,
  icon,
  handleChange,
  disabled = false,
  ...restProps
}: SliderBoxProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', my: 1.5 }}>
      {icon}
      <Typography id={`${label}Label`} sx={{ mr: 2, whiteSpace: 'nowrap' }}>
        {label}
      </Typography>
      <Slider
        name={label}
        id={label}
        aria-labelledby={`${label}Label`}
        valueLabelDisplay={valueLabelDisplay}
        step={step}
        min={min}
        max={max}
        defaultValue={value}
        value={value}
        marks={marks}
        onChangeCommitted={handleChange}
        disabled={disabled}
        {...restProps}
      />
    </Box>
  );
}
