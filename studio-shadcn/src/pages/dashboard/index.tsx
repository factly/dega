import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Check, Clock, FileEdit, FileClock } from "lucide-react";
import { getInfo } from "../../actions/info";
import Loader from "../../components/Loader";
import MobileBreadcrumb from "@/components/MobileBreadcrumb";
import StatisticCard from "./components/StatisticCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { RootState } from "./types";

const Dashboard: React.FC = () => {
  const { spaces, info } = useSelector((state: RootState) => ({
    spaces: state.spaces,
    info: state.info,
  }));
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (spaces.selected !== "") {
      dispatch(getInfo());
    }
  }, [spaces.selected, dispatch]);

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

  const renderStats = (
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
    <>
      <Helmet title={"Dashboard"} />

      {/* Mobile Breadcrumb */}
      {isMobile && (
        <MobileBreadcrumb currentPage="Home" parentLabel="Dashboard" />
      )}

      <div className={`${isMobile ? "" : "p-6"}`}>
        <div
          className="container mx-auto"
          style={{
            maxWidth: isMobile ? "100%" : "1200px",
          }}
        >
          {isMobile && (
            <h1 className="text-xl font-semibold mb-4">Dashboard</h1>
          )}

          <div className={`space-y-${isMobile ? "4" : "6"}`}>
            {renderStats(
              "Posts",
              articlePublish + articleDraft + articleReady + articleFuture,
              articlePublish,
              articleFuture,
              articleDraft,
              articleReady,
              "/posts"
            )}

            {renderStats(
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
    </>
  );
};

export default Dashboard;
