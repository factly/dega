// import React from 'react';
// import { FormField, FormItem, FormLabel } from '@/components/ui/form';
// import { Textarea } from '@/components/ui/textarea';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent } from '@/components/ui/card';
// import axios from 'axios';
// import { MEDIA_API } from '../../constants/media';
// import { useSelector } from 'react-redux';
// import { ImagePlus } from 'lucide-react';
// import { RootState } from '../../types/index';

// interface DescriptionInputProps {
//   name?: string;
//   label?: string;
//   noLabel?: boolean;
//   onChange?: (value: any) => void;
//   inputProps?: any;
//   formItemProps?: any;
//   initialValue?: string;
//   rows?: number;
// }

// interface UploadConfig {
//   restrictions: {
//     maxFileSize: number;
//     allowedFileTypes: string[];
//   };
//   onBeforeUpload: (files: any) => any;
// }

// interface UploadResult {
//   successful: {
//     size: number;
//     fileName: string;
//     response: {
//       body: {
//         key: string;
//       };
//     };
//     uploadURL: string;
//     meta: {
//       type: string;
//       caption?: string;
//       width?: number;
//       height?: number;
//     };
//   }[];
// }

// const DescriptionInput: React.FC<DescriptionInputProps> = ({
//   name = 'description',
//   label = 'Description',
//   noLabel = false,
//   onChange = () => {},
//   inputProps,
//   formItemProps,
//   initialValue,
//   rows,
// }) => {
//   const space_slug = useSelector((state: RootState) => {
//     return state.spaces.details[state.spaces.selected]?.slug;
//   });

//   const mergedInputProps = { ...inputProps, onChange };
//   const mergedFormItemProps = noLabel ? formItemProps : { ...formItemProps, label };

//   const uploadConfig: UploadConfig = {
//     restrictions: {
//       maxFileSize: 5242880, // 5MB
//       allowedFileTypes: ['.jpg', '.jpeg', '.png', '.gif'],
//     },
//     onBeforeUpload: (files) => {
//       const updatedFiles: Record<string, any> = {};

//       Object.keys(files).forEach((fileID) => {
//         updatedFiles[fileID] = {
//           ...files[fileID],
//           fileName: files[fileID].meta.name,
//           meta: {
//             ...files[fileID].meta,
//             name:
//               space_slug +
//               '/' +
//               new Date().getFullYear() +
//               '/' +
//               new Date().getMonth() +
//               '/' +
//               Date.now().toString() +
//               '_' +
//               files[fileID].meta.name,
//           },
//         };
//       });
//       return updatedFiles;
//     },
//   };

//   const handleFileUpload = async (file: File) => {
//     if (!uploadConfig.restrictions.allowedFileTypes.some(type => 
//       file.name.toLowerCase().endsWith(type))) {
//       console.error('Invalid file type');
//       return;
//     }

//     if (file.size > uploadConfig.restrictions.maxFileSize) {
//       console.error('File too large');
//       return;
//     }

//     const formData = new FormData();
//     formData.append('file', file);

//     try {
//       const response = await axios.post(MEDIA_API, formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });

//       const upload = {
//         alt_text: file.name,
//         caption: file.name,
//         description: file.name,
//         file_size: file.size,
//         name: file.name,
//         slug: response.data.key,
//         title: file.name,
//         type: file.type,
//         url: {
//           raw: response.data.url,
//         },
//       };

//       await axios.post(MEDIA_API, [upload]);
//     } catch (error) {
//       console.error('Upload error:', error);
//     }
//   };

//   return (
//     <FormField
//       name={name}
//       render={({ field }) => (
//         <FormItem {...mergedFormItemProps}>
//           {!noLabel && <FormLabel>{label}</FormLabel>}
//           <Card className="p-0">
//             <CardContent className="space-y-4 p-4">
//               <Textarea
//                 {...mergedInputProps}
//                 {...field}
//                 rows={rows || 10}
//                 value={field.value || initialValue || ''}
//                 className="min-h-[100px] flex-1"
//                 placeholder="Enter your description here..."
//               />
//               <div className="flex items-center gap-2">
//                 <Button
//                   type="button"
//                   variant="outline"
//                   size="sm"
//                   onClick={() => {
//                     const input = document.createElement('input');
//                     input.type = 'file';
//                     input.accept = uploadConfig.restrictions.allowedFileTypes.join(',');
//                     input.onchange = (e) => {
//                       const file = (e.target as HTMLInputElement).files?.[0];
//                       if (file) {
//                         handleFileUpload(file);
//                       }
//                     };
//                     input.click();
//                   }}
//                 >
//                   <ImagePlus className="mr-2 h-4 w-4" />
//                   Upload Image
//                 </Button>
//                 <p className="text-sm text-muted-foreground">
//                   Max file size: {uploadConfig.restrictions.maxFileSize / 1024 / 1024}MB
//                 </p>
//               </div>
//             </CardContent>
//           </Card>
//         </FormItem>
//       )}
//     />
//   );
// };


// export default DescriptionInput;