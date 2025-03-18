import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search } from "lucide-react";
import {
  getSachFactChecks,
  getSachFilters,
} from "../../actions/sachFactChecks";
import FactCheck from "./components/sach-fact-check";
import { getResultStringFromStats } from "../../utils/getStats";

// Shadcn UI components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";

// Types
interface FormValues {
  query: string;
}

interface FactCheck {
  // Define the structure of a fact check based on your data
  id: string;
  // Add other properties as needed
}

interface SachFactChecksState {
  details: FactCheck[];
  loading: boolean;
}

interface RootState {
  sachFactChecks: SachFactChecksState;
}

interface ResultStats {
  // Define the structure of result stats
  [key: string]: any;
}

function Factly(): React.ReactElement {
  const dispatch = useDispatch();
  const form = useForm<FormValues>();

  const [language, setLanguage] = useState<string[]>([]);
  const [publisher, setPublisher] = useState<string[]>([]);
  const [country, setCountry] = useState<string[]>([]);
  const [dateOrder, setDateOrder] = useState<string>("");
  const [publisherList, setPublishersList] = useState<string[]>([]);
  const [publisherCountries, setPublisherCountries] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [query, setQuery] = useState<string>("");
  const [pageNum, setPageNum] = useState<number>(1);
  const [totalMatches, setTotalMatches] = useState<number>(0);
  const [resultStats, setResultStats] = useState<ResultStats>({});
  const [isResultTextVisible, setIsResultTextVisible] =
    useState<boolean>(false);
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(false);

  const languageNames = new Intl.DisplayNames(["en"], { type: "language" });
  const pageLimit = 20;

  const fetchFilters = () => {
    dispatch(
      getSachFilters(setLanguages, setPublishersList, setPublisherCountries)
    );
  };

  const fetchFactChecks = () => {
    dispatch(
      getSachFactChecks(
        {
          q: query,
          selectedLanguage: language,
          selectedPublisher: publisher,
          selectedCountry: country,
          limit: pageLimit,
          sortByDate: dateOrder,
          offset: (pageNum - 1) * pageLimit,
        },
        setTotalMatches,
        setResultStats
      )
    );
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchFactChecks();
    setIsResultTextVisible(true);
  }, [language, publisher, country, dateOrder, query, pageNum]);

  useEffect(() => {
    setPageNum(1);
    setIsResultTextVisible(false);
  }, [query]);

  useEffect(() => {
    if (query === "" || query === undefined) {
      setDateOrder("desc");
    } else {
      setDateOrder("");
    }
  }, [query]);

  useEffect(() => {
    setDateOrder((prevDateOrder) => prevDateOrder);
  }, [dateOrder]);

  const handleFinish = (formData: FormValues) => {
    setQuery(formData.query);
  };

  const handleDateChange = (date: string) => {
    setDateOrder(date);
  };

  const handleCountryChange = (selectedCountries: string[]) => {
    setCountry(selectedCountries);
  };

  const handlePublisherChange = (selectedPublishers: string[]) => {
    setPublisher(selectedPublishers);
  };

  const handleLanguageChange = (selectedLanguages: string[]) => {
    setLanguage(selectedLanguages);
  };

  const { factChecks, loading } = useSelector((state: RootState) => {
    return {
      factChecks: state.sachFactChecks.details,
      loading: state.sachFactChecks.loading,
    };
  });

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col md:flex-row justify-between mb-4 w-full">
        <div className={`${isMobileScreen ? "w-full" : "w-2/3"} mb-4 md:mb-0`}>
          <form
            onSubmit={form.handleSubmit(handleFinish)}
            className="flex space-x-2"
          >
            <div className="relative w-full">
              <Search
                className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                size={16}
              />
              <Input
                {...form.register("query")}
                className="pl-8 w-full"
                placeholder="Search for Fact-Checks about a person or topic or a specific claim"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </div>

        <div
          className={`flex items-center gap-2 ${isMobileScreen ? "mt-4" : ""}`}
        >
          <span>Sort by:</span>
          <Select
            value={dateOrder || undefined}
            onValueChange={handleDateChange}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Sort by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Latest</SelectItem>
              <SelectItem value="asc">Oldest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-2">
          <span>Languages:</span>
          <div className="w-full">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {languageNames.of(lang)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span>Countries:</span>
          <div className="w-full">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select Country" />
              </SelectTrigger>
              <SelectContent>
                {publisherCountries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span>Publishers:</span>
          <div className="w-full">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select Publisher" />
              </SelectTrigger>
              <SelectContent>
                {publisherList.map((publisher) => (
                  <SelectItem key={publisher} value={publisher}>
                    {publisher}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <div className="mt-5">
          {isResultTextVisible && factChecks?.length ? (
            <p className="text-gray-600 text-base">
              {getResultStringFromStats(resultStats, totalMatches)}
            </p>
          ) : null}

          {factChecks?.length
            ? factChecks.map((factCheck, index) => (
                <FactCheck factCheck={factCheck} key={index} />
              ))
            : null}

          {totalMatches > pageLimit ? (
            <div className="flex justify-between items-center mt-5 gap-3">
              {pageNum * pageLimit < totalMatches ? (
                <div className="ml-auto">
                  {/* Next button removed as requested */}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default Factly;
