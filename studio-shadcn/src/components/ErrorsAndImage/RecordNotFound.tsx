import React from 'react';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface RecordNotFoundProps {
  status?: string;
  title?: string;
  link?: string;
  entity?: string;
}

const RecordNotFound: React.FC<RecordNotFoundProps> = ({
  status = '404',
  title = 'Sorry, could not find what you are looking for.',
  link,
  entity = 'Format'
}) => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="text-lg font-semibold">
          {status}
        </AlertTitle>
        <AlertDescription className="mt-2">
          {title}
          {link && (
            <div className="mt-4">
              <Link to={link}>
                <Button variant="outline">
                  Create {entity}
                </Button>
              </Link>
            </div>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default RecordNotFound;