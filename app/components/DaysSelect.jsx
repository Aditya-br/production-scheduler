'use client';
import React from 'react';
import { Dropdown } from 'semantic-ui-react';

const getDayOptionsForCurrentMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return Array.from({ length: daysInMonth }, (_, i) => ({
    key: `day-${i + 1}`,
    value: i + 1,
    text: `${i + 1}`,
  }));
};

const DaysSelect = ({ disabled, onChange }) => {
  const dayOptions = getDayOptionsForCurrentMonth();

  return (
    <Dropdown
      placeholder="Select Special Leaves(exclude Leave Days)"
      fluid
      multiple
      search
      selection
      options={dayOptions}
      onChange={(e, { value }) => onChange(value)}
    />
  );
};

export default DaysSelect;
