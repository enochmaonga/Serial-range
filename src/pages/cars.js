import CarsRegistry from "@/components/Data/CarsRegistry";
import Head from "next/head";

const Cars = () => {
  return (
    <>
     <Head>
        <title> KCC | Cars</title>
      </Head>
      
      <CarsRegistry />
    </>
  );
};

export default Cars;