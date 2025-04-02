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
import MobileBreadcrumb from "@/components/MobileBreadcrumb";

// Hooks
import { useIsMobile } from "@/hooks/use-mobile";
import { useSidebar } from "@/components/ui/sidebar";

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
  sidebar: {
    collapsed: boolean;
  };
}

// Statistic card component
const StatisticCard: React.FC<{
  title: string;
  value: number;
  loading: boolean;
  icon?: React.ReactNode;
  href: string;
  isMobile: boolean;
}> = ({ title, value, loading, icon, href, isMobile }) => {
  return (
    <Link to={href} className="block">
      <Card
        className={`hover:bg-muted/50 transition-colors h-full ${
          isMobile ? "p-1" : ""
        }`}
      >
        <CardHeader className={`${isMobile ? "p-3 pb-1" : "pb-2"}`}>
          <CardTitle
            className={`${
              isMobile ? "text-xs" : "text-sm"
            } font-medium flex items-center gap-2`}
          >
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className={isMobile ? "p-3 pt-1" : undefined}>
          {loading ? (
            <div className="h-6 w-12 bg-muted animate-pulse rounded" />
          ) : (
            <span className={`${isMobile ? "text-lg" : "text-2xl"} font-bold`}>
              {value}
            </span>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

const Dashboard: React.FC = () => {
  const { spaces, info, sidebar } = useSelector((state: RootState) => ({
    spaces: state.spaces,
    info: state.info,
    sidebar: state.sidebar,
  }));
  const dispatch = useDispatch();
  const isMobile = useIsMobile();
  const { state: sidebarState } = useSidebar();

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

  const isCollapsed = sidebarState === "collapsed" && !isMobile;

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
      <CardHeader className={`pb-2 border-b ${isMobile ? "p-3" : ""}`}>
        <CardTitle className={`${isMobile ? "text-base" : "text-lg"}`}>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className={`${isMobile ? "p-3 pt-3" : "pt-4"}`}>
        <div
          className={`grid ${
            isMobile ? "grid-cols-2 gap-2" : "grid-cols-5 gap-4"
          }`}
        >
          <StatisticCard
            title="Total"
            value={totalCount}
            loading={loading}
            icon={<FileText size={isMobile ? 14 : 16} />}
            href={baseUrl}
            isMobile={isMobile}
          />
          <StatisticCard
            title="Published"
            value={publishCount}
            loading={loading}
            icon={<Check size={isMobile ? 14 : 16} />}
            href={`${baseUrl}?status=publish`}
            isMobile={isMobile}
          />
          <StatisticCard
            title="Future publish"
            value={futureCount}
            loading={loading}
            icon={<Clock size={isMobile ? 14 : 16} />}
            href={`${baseUrl}?status=future`}
            isMobile={isMobile}
          />
          <StatisticCard
            title="Draft"
            value={draftCount}
            loading={loading}
            icon={<FileEdit size={isMobile ? 14 : 16} />}
            href={`${baseUrl}?status=draft`}
            isMobile={isMobile}
          />
          <StatisticCard
            title="Ready to publish"
            value={readyCount}
            loading={loading}
            icon={<FileClock size={isMobile ? 14 : 16} />}
            href={`${baseUrl}?status=ready`}
            isMobile={isMobile}
          />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col h-full">
      <Helmet title={"Dashboard"} />

      {/* Mobile Breadcrumb */}
      {isMobile && (
        <MobileBreadcrumb
          currentPage="Dashboard"
          parentPath="/"
          parentLabel="Core"
        />
      )}

      <div
        className={`${isMobile ? "p-4" : "p-6"}`}
        style={
          !isMobile
            ? {
                position: "absolute",
                top: 0,
                left: isCollapsed ? "89px" : "265px",
                right: 0,
                bottom: 0,
                transition: "left 0.3s ease",
                overflow: "auto",
              }
            : { overflow: "auto", flex: 1 }
        }
      >
        {!isMobile && <h1 className="text-2xl font-bold mb-6">Dashboard</h1>}
        {isMobile && <h1 className="text-xl font-semibold mb-4">Dashboard</h1>}

        <div className={`space-y-${isMobile ? "4" : "6"}`}>
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
            factCheckPublish +
              factCheckDraft +
              factCheckReady +
              factCheckFuture,
            factCheckPublish,
            factCheckFuture,
            factCheckDraft,
            factCheckReady,
            "/fact-checks"
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
