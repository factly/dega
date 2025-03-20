import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  X,
  Edit,
  Calendar,
} from 'lucide-react';
import { deletePage } from '../../../actions/pages';
import { Link } from 'react-router-dom';
import QuickEdit from '../../../components/List/QuickEdit';
import useNavigation from '../../../utils/useNavigation';
import { useAppDispatch } from '@/hooks/reduxHooks';

interface Page {
  id: number;
  title: string;
  status: string;
  updated_at?: string;
  created_at?: string;
  tag_ids?: number[];
  category_ids?: number[];
  [key: string]: any;
}

interface Tag {
  id: number;
  name: string;
  [key: string]: any;
}

interface Category {
  id: number;
  name: string;
  [key: string]: any;
}

interface Format {
  id: string;
  slug: string;
  [key: string]: any;
}

interface PageListProps {
  format: Format;
  data: {
    pages: Page[];
    loading: boolean;
    total: number;
    tags: Record<number, Tag>;
    categories: Record<number, Category>;
  };
  filters: {
    page?: number;
    limit?: number;
    tag?: string[];
    category?: string[];
    [key: string]: any;
  };
  onPagination: (page: number, limit: number) => void;
  fetchPages: () => void;
}

function PageList({ format, data, filters, onPagination, fetchPages }: PageListProps) {
  const dispatch = useAppDispatch();
  const [id, setID] = useState<number>(0);
  const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([0]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [deleteItemID, setDeleteItemID] = useState<number | null>(null);

  const navigate = useNavigation();

  const handleDeletePage = () => {
    if (deleteItemID) {
      dispatch(deletePage(deleteItemID) as any).then(() => fetchPages());
      setModalOpen(false);
      setDeleteItemID(null);
    }
  };

  // Function to format date - simplified for example
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(date);
    } catch (error) {
      return dateString;
    }
  };

  // Function to get time difference from now
  const getDifferenceInModifiedTime = (dateString?: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }
  };

  const renderStatus = (status: string) => {
    switch (status) {
      case 'publish':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="mr-1 h-3 w-3" /> Published
          </Badge>
        );
      case 'draft':
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            <AlertCircle className="mr-1 h-3 w-3" /> Draft
          </Badge>
        );
      case 'ready':
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <Clock className="mr-1 h-3 w-3" /> Ready to Publish
          </Badge>
        );
      case 'future':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Calendar className="mr-1 h-3 w-3" /> Future Publish
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[250px] w-[40%]">Title</TableHead>
            <TableHead className="w-[15%]">Status</TableHead>
            <TableHead className="w-[25%]">Last Modified</TableHead>
            <TableHead className="w-[20%] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.loading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-10">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5"></div>
                  <span>Loading...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : data.pages.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-16">
                <div className="flex flex-col items-center space-y-2">
                  <div className="text-gray-400 rounded-full bg-gray-100 p-4">
                    <AlertCircle className="h-8 w-8" />
                  </div>
                  <p className="text-gray-500 font-medium">No pages found</p>
                  <p className="text-gray-400 text-sm">Try adjusting your filters or create a new page</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data.pages.map((item) => {
              const isOpen = item.id === expandedRowKeys[0];
              // Ensure tag_ids and category_ids are always arrays, even if undefined
              const tagIds = item.tag_ids || [];
              const categoryIds = item.category_ids || [];
              
              return (
                <React.Fragment key={item.id}>
                  <TableRow
                    className="cursor-pointer hover:bg-blue-50 transition-colors"
                    onClick={() => navigate(`/pages/${item.id}/edit`)}
                  >
                    <TableCell className="py-3">
                      <Link 
                        to={`/pages/${item.id}/edit`}
                        className="text-base font-medium text-gray-900 hover:text-blue-600"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {item.title}
                      </Link>
                    </TableCell>
                    <TableCell>{renderStatus(item.status)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {formatDate(item.updated_at)}
                        </span>
                        <span className="text-gray-500 text-sm">
                          {getDifferenceInModifiedTime(item.updated_at)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            isOpen ? setExpandedRowKeys([]) : setExpandedRowKeys([item.id]);
                            return setID(item.id);
                          }}
                        >
                          {isOpen ? 
                            <><X className="h-4 w-4 text-gray-500 mr-1" /> Close</> : 
                            <><Edit className="h-4 w-4 text-gray-500 mr-1" /></>
                          }
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 bg-transparent border-red-200 hover:bg-red-50 hover:text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalOpen(true);
                            setDeleteItemID(item.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {isOpen && (
                    <TableRow>
                      <TableCell colSpan={4} className="p-0">
                        <div className=" p-4">
                          <QuickEdit
                            data={item}
                            page={true}
                            setID={setID}
                            slug={format.slug}
                            onQuickEditUpdate={() => setExpandedRowKeys([])}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })
          )}
        </TableBody>
      </Table>
      
      {data.total > 0 && (
        <div className="flex items-center justify-between py-4 px-6">
          <div className="text-sm text-gray-500">
            {filters.page && (
              <>
                Showing {((Number(filters.page) - 1) * (Number(filters.limit) || 10)) + 1}-
                {Math.min(Number(filters.page) * (Number(filters.limit) || 10), data.total)} of {data.total} results
              </>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              className="h-8 px-3"
              disabled={!filters.page || Number(filters.page) <= 1}
              onClick={() => onPagination(Number(filters.page) - 1, Number(filters.limit) || 10)}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="h-8 px-3 bg-white"
              disabled={!filters.page || Number(filters.page) * (Number(filters.limit) || 10) >= data.total}
              onClick={() => onPagination(Number(filters.page) + 1, Number(filters.limit) || 10)}
            >
              Next
            </Button>
            <select 
              className="h-8 rounded-md px-3 py-1 text-sm"
              value={filters.limit || 10}
              onChange={(e) => onPagination(1, Number(e.target.value))}
            >
              {[10, 15, 20].map((size) => (
                <option key={size} value={size}>{size} per page</option>
              ))}
            </select>
          </div>
        </div>
      )}
      
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[311px]">
          <DialogHeader>
            <DialogTitle className="text-base font-medium text-gray-900">
              Delete Confirmation
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to delete this page?
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePage}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PageList;