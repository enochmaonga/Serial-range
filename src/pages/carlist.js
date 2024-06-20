import CarsTable from "@/components/Data/CarsTable";
import Head from "next/head";

const Cars = () => {
  return (
    <>
      <Head>
        <title> KCC | Available Cars</title>
      </Head>

      <CarsTable />
    </>
  );
};

export default Cars;
