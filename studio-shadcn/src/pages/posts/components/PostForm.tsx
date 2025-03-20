import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { Settings, ChevronDown } from 'lucide-react';
import dayjs from 'dayjs';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';

import RightPanel from './PostSettingsPanel';
import { maker } from '../../../utils/sluger';
import getJsonValue from '../../../utils/getJsonValue';
import useNavigation from '../../../utils/useNavigation';
import { addTemplate } from '../../../actions/posts';
import { addErrorNotification } from '../../../actions/notifications';

// types
export interface Post {
  id?: number;
  title?: string;
  slug?: string;
  status?: 'draft' | 'ready' | 'publish' | 'future';
  description?: any;
  description_html?: string;
  excerpt?: string;
  subtitle?: string;
  featured_medium_id?: number;
  is_featured?: boolean;
  is_exclude_from_homepage?: boolean;
  published_date?: string | null;
  created_at?: string;
  updated_at?: string;
  category_ids?: number[];
  categories?: number[];
  tag_ids?: number[];
  tags?: number[];
  format_id?: number;
  format?: number;
  author_ids?: number[];
  authors?: number[];
  meta?: {
    title?: string;
    description?: string;
    canonical_URL?: string;
  };
  header_code?: string;
  footer_code?: string;
  meta_fields?: string | Record<string, any>;
  custom_format?: string;
  language?: string;
  schemas?: any[];
}

export interface Format {
  id: number;
  name?: string;
}

export interface PostFormProps {
  onCreate: (values: Post) => void;
  data?: Post;
  format: Format;
  page?: boolean;
}

const PostForm: React.FC<PostFormProps> = ({ 
  onCreate, 
  data = {}, 
  format, 
  page = false,
}) => {
  const navigate = useNavigation();
  const formRef = useRef<HTMLFormElement>(null);
  const dispatch = useDispatch();
  const [status, setStatus] = useState<'draft' | 'ready' | 'publish' | 'future'>(
    data.status as any || 'draft'
  );
  const [valueChange, setValueChange] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  const [formData, setFormData] = useState<Post>({ ...data });

  // Create form instance
  const form = useForm<Post>({
    defaultValues: { 
      ...data,
      // Initialize published_date properly if it exists
      published_date: data.published_date ? data.published_date : null
    }
  });
  
  // Update local form data state when form values change
  useEffect(() => {
    const subscription = form.watch((value) => {
      // Ensure authors and author_ids are in sync
      if (value.authors && !value.author_ids) {
        form.setValue('author_ids', value.authors);
      }
      setFormData(value as Post);
    });
    return () => subscription.unsubscribe();
  }, [form.watch, form]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [shouldBlockNavigation, setShouldBlockNavigation] = useState(false);

  const getCurrentDate = () => {
    return dayjs().format('YYYY-MM-DDTHH:mm:ssZ');
  };

  const onSave = (values: Post) => {
    const finalData: Post = { ...values };
  
    // Copy any missing properties from original data
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        if (!Object.prototype.hasOwnProperty.call(finalData, key)) {
          (finalData as any)[key] = (data as any)[key];
        }
      }
    }
  
    setShouldBlockNavigation(false);
    
    if (finalData.meta_fields) {
      finalData.meta_fields = getJsonValue(finalData.meta_fields);
    }
    
    // Ensure arrays are properly initialized to prevent undefined issues
    finalData.category_ids = finalData.categories || [];
    finalData.tag_ids = finalData.tags || [];
    finalData.format_id = format.id;
    finalData.author_ids = finalData.authors || [];
    finalData.status = status;
    
    // Validate that authors are assigned when publishing or scheduling future publish
    if ((status === 'publish' || status === 'future') && (!finalData.author_ids || finalData.author_ids.length === 0)) {
      dispatch(addErrorNotification('At least one author must be assigned.'));
      return;
    }
    
    // Handle published_date based on status
    if (status === 'future') {
      // For future publishing, a date is required
      if (!finalData.published_date) {
        dispatch(addErrorNotification('Published date is required for future publishing.'));
        return;
      }
      // Format the published date properly
      finalData.published_date = dayjs(finalData.published_date).format('YYYY-MM-DDTHH:mm:ssZ');
    } 
    else if (status === 'publish') {
      // For immediate publishing, use current date if not provided
      finalData.published_date = finalData.published_date 
        ? dayjs(finalData.published_date).format('YYYY-MM-DDTHH:mm:ssZ') 
        : getCurrentDate();
    }
    // For draft or ready, keep the published date if set
    
    onCreate(finalData);
    setValueChange(false); // Reset value change flag after saving
  };

  const onTitleChange = (string: string) => {
    if (status !== 'publish') {
      form.setValue('slug', maker(string));
    }
  };

  const createTemplate = () => {
    if (data.id) {
      dispatch(addTemplate({ post_id: parseInt(data.id.toString()) }) as any).then(() => {
        page ? navigate('/pages') : navigate('/posts');
      });
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (shouldBlockNavigation) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [shouldBlockNavigation]);

  // Function to handle form submission
  const handleSubmitForm = (formStatus: 'draft' | 'ready' | 'publish' | 'future') => {
    setStatus(formStatus);
    const formValues = form.getValues();
    onSave(formValues);
  };

  const postActions = [
    {
      key: 'draft',
      label: 'Save Draft',
      onClick: () => handleSubmitForm('draft'),
      disabled: !valueChange
    },
    {
      key: 'ready',
      label: 'Ready to Publish',
      onClick: () => handleSubmitForm('ready'),
      disabled: !valueChange
    },
    {
      key: 'future',
      label: 'Future Publish',
      onClick: () => {
        // Check if we have a published date
        const publishedDate = form.getValues('published_date');
        if (!publishedDate) {
          dispatch(addErrorNotification('Published date is required for future publishing.'));
          return;
        }
        
        handleSubmitForm('future');
      },
      disabled: !valueChange
    }
  ];

  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        const formValues = form.getValues();
        
        // Check if authors are assigned when publishing
        const currentAuthors = formValues.authors || [];
        if (currentAuthors.length === 0) {
          dispatch(addErrorNotification('At least one author must be assigned for publishing.'));
          return;
        }
        
        setStatus('publish'); // Default action is publish
        onSave(formValues);
      }}
      className="max-w-full w-full edit-form"
      onChange={() => {
        setShouldBlockNavigation(true);
        setValueChange(true);
      }}
    >
      <div className="space-y-4">
        <div className="flex justify-end">
          <div className="flex items-center space-x-2">
            {data.id ? (
              <Button variant="outline" onClick={createTemplate}>
                Create Template
              </Button>
            ) : null}
            
              <div className="flex items-center">
                <Button 
                  type="button"
                  onClick={() => {
                    // Only check for authors if we're publishing
                    const currentAuthors = form.getValues('authors') || [];
                    if (currentAuthors.length === 0) {
                      dispatch(addErrorNotification('At least one author must be assigned for publishing.'));
                      return;
                    }
                    
                    handleSubmitForm('publish');
                  }}
                  className="rounded-r-none border-r-0"
                >
                  <span>{data?.id && status === 'publish' ? 'Update' : 'Publish'}</span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      type="button"
                      className="px-2 rounded-l-none"
                      variant="default"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {postActions.map((action) => (
                      <DropdownMenuItem
                        key={action.key}
                        onClick={action.onClick}
                        disabled={action.disabled}
                      >
                        {action.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              type="button"
              onClick={() => setDrawerVisible(true)}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <div className="mx-auto w-full max-w-4xl px-4">
            <div className="mb-6">
              <Textarea
                className="border-none text-4xl font-bold text-center resize-none min-h-[100px]"
                placeholder={`Add title for the ${page ? 'page' : 'post'}`}
                onChange={(e) => {
                  form.setValue('title', e.target.value);
                  onTitleChange(e.target.value);
                }}
                value={form.watch('title') || ''}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Panel */}
      <RightPanel
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        form={form}
        formRef={formRef}
        data={formData}
        onSave={onSave}
        setStatus={setStatus}
        status={status}
        valueChange={valueChange}
        isMobileScreen={isMobileScreen}
        createTemplate={createTemplate}
      />
    </form>
  );
};

export default PostForm;