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

interface SlugInputProps {
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  formItemProps?: any;
  form: UseFormReturn<any>;
}

export const SlugInput: React.FC<SlugInputProps> = ({ 
  onChange, 
  inputProps = {}, 
  formItemProps = {},
  form
}) => {
  const finalInputProps = onChange ? { ...inputProps, onChange } : inputProps;

  return (
    <FormField
      control={form.control}
      name="slug"
      rules={{
        required: "Please input the slug!",
        pattern: {
          value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
          message: "Please enter valid slug!"
        }
      }}
      render={({ field }) => (
        <FormItem {...formItemProps}>
          <FormLabel>Slug</FormLabel>
          <FormControl>
            <Input {...field} {...finalInputProps} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};