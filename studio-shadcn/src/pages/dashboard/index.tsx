import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";

// ShadcN UI components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Lucide icons
import { FileText, Check, Clock, FileEdit, FileClock } from "lucide-react";

// Redux actions
import { getInfo } from "../../actions/info";

// Components
import Loader from "../../components/Loader";

// Define types for Redux state
interface RootState {
  spaces: {
    selected: string;
  };
  info: {
    article: {
      publish?: string | number;
      draft?: string | number;
      ready?: string | number;
      future?: string | number;
    };
    factCheck: {
      publish?: string | number;
      draft?: string | number;
      ready?: string | number;
      future?: string | number;
    };
    loading: boolean;
  };
}

// Statistic card component
const StatisticCard: React.FC<{
  title: string;
  value: number;
  loading: boolean;
  icon?: React.ReactNode;
  href: string;
}> = ({ title, value, loading, icon, href }) => {
  return (
    <Link to={href} className="block">
      <Card className="hover:bg-muted/50 transition-colors h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-6 w-12 bg-muted animate-pulse rounded" />
          ) : (
            <span className="text-2xl font-bold">{value}</span>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

const Dashboard: React.FC = () => {
  const { spaces, info } = useSelector((state: RootState) => ({
    spaces: state.spaces,
    info: state.info,
  }));
  const dispatch = useDispatch();

  useEffect(() => {
    if (spaces.selected !== "") fetchInfo();
  }, [spaces.selected]);

  const fetchInfo = () => {
    dispatch(getInfo());
  };

  const { article = {}, factCheck = {}, loading } = info;
  const articlePublish = Number(article.publish) || 0;
  const articleDraft = Number(article.draft) || 0;
  const articleReady = Number(article.ready) || 0;
  const articleFuture = Number(article.future) || 0;
  const factCheckPublish = Number(factCheck.publish) || 0;
  const factCheckDraft = Number(factCheck.draft) || 0;
  const factCheckReady = Number(factCheck.ready) || 0;
  const factCheckFuture = Number(factCheck.future) || 0;

  if (loading) {
    return <Loader />;
  }

  const renderStatsSection = (
    title: string,
    totalCount: number,
    publishCount: number,
    futureCount: number,
    draftCount: number,
    readyCount: number,
    baseUrl: string
  ) => (
    <Card className="bg-[#F0F5FF] border border-gray-200 shadow-sm">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-5 gap-4">
          <StatisticCard
            title="Total"
            value={totalCount}
            loading={loading}
            icon={<FileText size={16} />}
            href={baseUrl}
          />
          <StatisticCard
            title="Published"
            value={publishCount}
            loading={loading}
            icon={<Check size={16} />}
            href={`${baseUrl}?status=publish`}
          />
          <StatisticCard
            title="Future publish"
            value={futureCount}
            loading={loading}
            icon={<Clock size={16} />}
            href={`${baseUrl}?status=future`}
          />
          <StatisticCard
            title="Draft"
            value={draftCount}
            loading={loading}
            icon={<FileEdit size={16} />}
            href={`${baseUrl}?status=draft`}
          />
          <StatisticCard
            title="Ready to publish"
            value={readyCount}
            loading={loading}
            icon={<FileClock size={16} />}
            href={`${baseUrl}?status=ready`}
          />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Helmet title={"Dashboard"} />
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="space-y-6">
        {renderStatsSection(
          "Posts",
          articlePublish + articleDraft + articleReady + articleFuture,
          articlePublish,
          articleFuture,
          articleDraft,
          articleReady,
          "/posts"
        )}

        {renderStatsSection(
          "Fact Checks",
          factCheckPublish + factCheckDraft + factCheckReady + factCheckFuture,
          factCheckPublish,
          factCheckFuture,
          factCheckDraft,
          factCheckReady,
          "/fact-checks"
        )}
      </div>
    </div>
  );
};

export default Dashboard;
