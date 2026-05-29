import React from 'react';
import { Slider, Typography, Stack, Paper } from '@mui/material';

interface WeightsSliderProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    color: string;
    icon: React.ReactNode;
    disabled?: boolean;
}

export const WeightsSlider: React.FC<WeightsSliderProps> = ({
    label, value, onChange, color, icon, disabled
}) => (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Stack direction="row" spacing={2}
            sx={{ alignItems: "center", mb: 1 }}>
            {icon}
            <Typography variant="subtitle2"
                sx={{ fontWeight: 500 }}>{label}</Typography>
            <Typography variant="caption" color="text.secondary"
                sx={{ ml: 'auto' }}>
                {Math.round(value * 100)}%
            </Typography>
        </Stack>
        <Slider
            value={value}
            onChange={(_, val) => onChange(val as number)}
            min={0}
            max={1}
            step={0.05}
            valueLabelDisplay="auto"
            valueLabelFormat={(v) => `${Math.round(v * 100)}%`}
            disabled={disabled}
            sx={{
                color,
                '& .MuiSlider-valueLabel': { color: color },
                '&.Mui-disabled': { opacity: 0.5 }
            }}
        />
    </Paper>
);