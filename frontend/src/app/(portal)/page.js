import HeroBanner from "./_components/HeroBanner";
import Categories from "./_components/Categories";
import FeaturedCourses from "./_components/FeaturedCourses"
import UpcomingCourses from "./_components/UpcomingCourses"

export default function Home() {
  return (
    <>
      <HeroBanner />
      {/* <Categories /> */}
      <FeaturedCourses />
      <UpcomingCourses />
    </>
  );
}
