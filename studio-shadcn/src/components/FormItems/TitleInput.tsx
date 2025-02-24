import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { 
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form';

interface TitleInputProps {
  name?: string;
  label?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  formItemProps?: any;
  form: UseFormReturn<any>;
}

export const TitleInput: React.FC<TitleInputProps> = ({ 
  name = 'name',
  label = 'Title',
  onChange, 
  inputProps = {}, 
  formItemProps = {},
  form
}) => {
  const finalInputProps = onChange ? { ...inputProps, onChange } : inputProps;

  return (
    <FormField
      control={form.control}
      name={name}
      rules={{
        required: `Please enter a ${label.toLowerCase()}!`, 
        maxLength: {
          value: 500,
          message: `${label} must be maximum 500 characters.`
        }
      }}
      render={({ field }) => (
        <FormItem {...formItemProps}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...field} {...finalInputProps} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};