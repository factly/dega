import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Search } from "lucide-react";
import { getGoogleFactChecks, Query } from "../../actions/googleFactChecks";
import deepEqual from "deep-equal";
import { languageCode } from "../fact-checks/LanguageCode";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { Form, FormField, FormItem, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import Loader from "@/components/Loader";

// Define types
interface LanguageCode {
  code: string;
  language: string;
}

interface ClaimReview {
  publisher: {
    name: string;
  };
  textualRating: string;
  url: string;
  title: string;
}

interface FactCheck {
  text: string;
  claimant: string;
  claimReview: ClaimReview[];
}

interface FilterState extends Query {
  page: number;
  query: string;
  pageToken?: string;
  language?: string;
}

interface ReduxState {
  googleFactChecks: {
    loading: boolean;
    req: {
      query: FilterState;
      data: FactCheck[];
      total: number;
      nextPage: string;
    }[];
  };
}

interface FormValues {
  query: string;
  language: string;
}

function GoogleFactCheck(): React.ReactElement {
  const dispatch = useAppDispatch();
  const form = useForm<FormValues>({
    defaultValues: {
      query: "factcheck",
      language: "all",
    },
  });

  const langCode: LanguageCode[] = languageCode();

  const [filters, setQuery] = useState<FilterState>({
    page: 1,
    query: "factcheck",
  });

  const [currPageToken, setCurrPageToken] = useState<string>("");
  const [paginationStack, setPaginationStack] = useState<string[]>([]);
  const [indexPointer, setIndexPointer] = useState<number | null>(null);

  const { factChecks, loading, nextPage } = useSelector((state: ReduxState) => {
    const node = state.googleFactChecks.req.find((item) => {
      return deepEqual(item.query, filters);
    });

    if (node) {
      return {
        factChecks: node.data,
        total: node.total,
        loading: state.googleFactChecks.loading,
        nextPage: node.nextPage,
      };
    }
    return {
      factChecks: [],
      total: 0,
      loading: state.googleFactChecks.loading,
      nextPage: "",
    };
  });

  const fetchFactChecks = (values: FilterState): void => {
    dispatch(getGoogleFactChecks(values));
  };

  const onSubmit = (values: FormValues): void => {
    const formattedValues: FilterState = {
      page: 1,
      query: values.query,
    };

    if (values.language !== "all") {
      formattedValues.language = values.language;
    }

    setCurrPageToken("");
    setIndexPointer(null);
    setPaginationStack([]);
    setQuery(formattedValues);
  };

  useEffect(() => {
    if (filters.query) fetchFactChecks(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    if (!paginationStack.includes(currPageToken))
      setPaginationStack((paginationStack) => [
        ...paginationStack,
        currPageToken,
      ]);
  }, [paginationStack, currPageToken]);

  const onLoadMore = (): void => {
    if (indexPointer === null) {
      setIndexPointer(0);
    } else {
      if (indexPointer + 1 === paginationStack.length) {
        setIndexPointer(paginationStack.length);
      } else {
        setIndexPointer(indexPointer + 1);
      }
    }

    setCurrPageToken(nextPage);
    setQuery({ ...filters, pageToken: nextPage });
  };

  const loadPrevious = (): void => {
    if (indexPointer === null) return;

    const prev = paginationStack[indexPointer - 1];
    setIndexPointer(indexPointer - 1);
    setQuery({ ...filters, pageToken: prev });
  };

  return (
    <div className="flex flex-col space-y-4 w-full">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col md:flex-row gap-4 md:items-end"
        >
          <FormField
            control={form.control}
            name="query"
            rules={{ required: "Please enter your search query!" }}
            render={({ field }) => (
              <FormItem className="w-full md:w-1/5">
                <FormControl>
                  <div className="relative">
                    <Search className="absolute left-2 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search fact checks"
                      {...field}
                      className="pl-8"
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem className="w-full md:w-1/6">
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                      {langCode.map((e, key) => (
                        <SelectItem key={key} value={e.code}>
                          {e.language}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />

          <Button type="submit">Submit</Button>
        </form>
      </Form>

      <div className="border rounded-md">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader />
          </div>
        ) : (
          <>
            {factChecks.map((item, index) => (
              <Card
                key={`${item.text}-${index}`}
                className="border-0 border-b last:border-b-0"
              >
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <h5>{`Claim by ${item.claimant}:`}</h5>
                    <h4>{item.text}</h4>
                    {item.claimReview.map((each, idx) => (
                      <div key={idx} className="space-y-1">
                        <h3 className="font-medium">
                          <span className="font-bold">
                            {each.publisher.name}
                          </span>{" "}
                          rating:{" "}
                          <span className="font-bold">
                            {each.textualRating}
                          </span>
                        </h3>
                        <a
                          href={each.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {each.title}
                        </a>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>

      <div className="flex justify-end space-x-2 py-2">
        <Button
          variant="outline"
          disabled={indexPointer === null || indexPointer === 0}
          onClick={loadPrevious}
        >
          Back
        </Button>
        <Button
          variant="outline"
          disabled={!nextPage || nextPage === ""}
          onClick={onLoadMore}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default GoogleFactCheck;
