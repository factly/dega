import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { Search, Plus, ChevronUp, ChevronDown } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"




interface PostsProps {
  formats: any;
}

interface FilterFormValues {
  q?: string;
  sort?: string;
  tag?: string[];
  category?: string[];
  author?: string[];
  status?: string;
}

const Posts: React.FC<PostsProps> = ({ formats }) => {
  const { search, pathname } = useLocation()
  const query = new URLSearchParams(search)
  const navigate = useNavigate()

  const [expand, setExpand] = useState(false)
  const [searchFieldExpand, setSearchFieldExpand] = useState(false)
  const [isMobileScreen, setIsMobileScreen] = useState(false)
  const [status, setStatus] = useState('all')


  const postStatusItems = [
    { value: 'all', label: 'All' },
    { value: 'publish', label: 'Published' },
    { value: 'ready', label: 'Ready to Publish' },
    { value: 'draft', label: 'Drafts' },
  ]

  const onSave = (values: FilterFormValues) => {
    const searchFilter = new URLSearchParams()
    status !== 'all' && searchFilter.set('status', status)
    
    Object.entries(values).forEach(([key, value]) => {
      if (value) {
        if (['format', 'tag', 'author', 'category'].includes(key)) {
          (value as string[]).forEach(item => {
            searchFilter.append(key, item)
          })
        } else {
          if (status !== 'all') searchFilter.set(key, value as string)
        }
      }
    })



    navigate({
      pathname,
      search: '?' + searchFilter.toString(),
    })
  }


  return (
    <div className="space-y-6">
      <Helmet title="Posts" />
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            
            {searchFieldExpand ? (
              <div className="flex gap-2">
                <Input 
                  placeholder="Search posts"
                  className="w-64"
                  onChange={(e) => onSave({ q: e.target.value })}
                />
                <Button variant="outline" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSearchFieldExpand(true)}
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Search posts</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          <div className="space-y-4">
            <Link to="/posts/create">
              <Button
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Create
              </Button>
            </Link>

            <div className="flex items-center gap-4">
              <Select
                defaultValue="desc"
                onValueChange={(value) => onSave({ sort: value })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Latest</SelectItem>
                  <SelectItem value="asc">Oldest</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => setExpand(!expand)}
                className="gap-2"
              >
                {expand ? (
                  <>
                    Hide Filters
                    <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    More Filters
                    <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {expand && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              name="tag"
              render={() => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              name="category"
              render={() => (
                <FormItem>
                  <FormLabel>Categories</FormLabel>
                  <FormControl>

                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              name="author"
              render={() => (
                <FormItem>
                  <FormLabel>Authors</FormLabel>
                  <FormControl>

                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        )}

        <Tabs
          defaultValue={query.get('status') || 'all'}
          onValueChange={(value) => {
            value === 'all' ? query.delete('status') : query.set('status', value)
            setStatus(value)
            navigate({
              pathname,
              search: '?' + query.toString(),
            })
          }}
        >
          <TabsList>
            {postStatusItems.map((item) => (
              <TabsTrigger key={item.value} value={item.value}>
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  )
}

export default Posts