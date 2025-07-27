'use client';
import React from 'react';
import { Dropdown } from 'semantic-ui-react';

const dayOptions = [
  { key: 'mon', value: 'monday', text: 'Monday' },
  { key: 'tue', value: 'tuesday', text: 'Tuesday' },
  { key: 'wed', value: 'wednesday', text: 'Wednesday' },
  { key: 'thu', value: 'thursday', text: 'Thursday' },
  { key: 'fri', value: 'friday', text: 'Friday' },
  { key: 'sat', value: 'saturday', text: 'Saturday' },
  { key: 'sun', value: 'sunday', text: 'Sunday' },
];

const MultiSelect = ({ disabled, onChange }) => {
  return (
    <Dropdown
      placeholder="Select Leave Days"
      fluid
      multiple
      search
      selection
      options={dayOptions}
      disabled={disabled}
      onChange={(e, { value }) => onChange(value)} // Passes array of selected values
    />
  );
};

export default MultiSelect;
