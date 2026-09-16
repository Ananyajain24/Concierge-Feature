import { BeachScene, DayTripScene, SailScene, SunsetScene, WatersportScene } from "./nature";
import { ChurchScene, FortScene, MarketScene, SpaScene } from "./built";
import { BarScene, CafeScene, PavilionScene, RestaurantScene } from "./hospitality";

// One drawn scene per POI category — never a generic pin. Adding a category
// means one scene component and one line here.
//
// `heritage` splits on the name: a basilica is not a fort, and Goa has plenty
// of both. Same for a river cruise, which reads as a boat rather than a kayak.
const CHURCH = /church|basilica|cathedral|chapel|convent|se\s+c/i;
const SAIL = /cruise|sail|boat|ferry|backwater/i;

export function PlaceScene({
  category,
  name,
  uid,
}: {
  category: string;
  name: string;
  uid: string;
}) {
  switch (category) {
    case "beach":
      return <BeachScene />;
    case "heritage":
      return CHURCH.test(name) ? <ChurchScene /> : <FortScene />;
    case "market":
      return <MarketScene uid={uid} />;
    case "restaurant":
      return <RestaurantScene />;
    case "cafe":
      return <CafeScene />;
    case "bar":
      return <BarScene />;
    case "spa":
      return <SpaScene />;
    case "sunset_point":
      return <SunsetScene />;
    case "watersport":
      return SAIL.test(name) ? <SailScene /> : <WatersportScene />;
    case "day_trip":
      return SAIL.test(name) ? <SailScene /> : <DayTripScene />;
    default:
      return <PavilionScene />;
  }
}

// Half-width of each scene, used to keep name labels clear of the artwork.
export function sceneRadius(category: string): number {
  switch (category) {
    case "beach":
      return 31;
    case "heritage":
      return 30;
    case "day_trip":
      return 30;
    case "market":
    case "restaurant":
    case "bar":
      return 27;
    default:
      return 24;
  }
}
