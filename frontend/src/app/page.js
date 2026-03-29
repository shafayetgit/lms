import HeroBanner from "./_partials/HeroBanner";
import Categories from "./_partials/Categories";
import FeaturedCourses from "./_partials/FeaturedCourses";
import { Divider } from "@mui/material";

export default function Home() {
  return (
    <>
      <HeroBanner />
      <Categories />
      <FeaturedCourses />
    </>
  );
}
