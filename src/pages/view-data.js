import DataTable from "@/components/Data/ViewData";
import Head from "next/head";

const Home = () => {
  return (
    <>
      <Head>
        <title> KCC | View Data</title>
      </Head>
      <DataTable />
    </>
  );
};

export default Home;
