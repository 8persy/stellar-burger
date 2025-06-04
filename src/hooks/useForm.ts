import { useState } from 'react';

export const useForm = <TForm>(inputValues: TForm) => {
  const [values, setValues] = useState(inputValues);

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = evt.currentTarget;
    setValues({ ...values, [name]: value });
  };

  return { values, handleChange, setValues };
};
