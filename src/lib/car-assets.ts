import porscheGt3 from "@/assets/cars/porsche-gt3.jpg";
import lamboRevuelto from "@/assets/cars/lambo-revuelto.jpg";
import rollsSpectre from "@/assets/cars/rolls-spectre.jpg";
import ferrariRoma from "@/assets/cars/ferrari-roma.jpg";
import gwagon from "@/assets/cars/gwagon.jpg";
import rangeRover from "@/assets/cars/range-rover.jpg";
import mustangClassic from "@/assets/cars/mustang-classic.jpg";
import teslaPlaid from "@/assets/cars/tesla-plaid.jpg";
import heroAtmosphere from "@/assets/hero-atmosphere.jpg";

export const carImages: Record<string, string> = {
  "porsche-gt3": porscheGt3,
  "lambo-revuelto": lamboRevuelto,
  "rolls-spectre": rollsSpectre,
  "ferrari-roma": ferrariRoma,
  gwagon,
  "range-rover": rangeRover,
  "mustang-classic": mustangClassic,
  "tesla-plaid": teslaPlaid,
};

export const heroAtmosphereImg = heroAtmosphere;

export function carImageFor(key: string | null | undefined): string {
  if (!key) return heroAtmosphere;
  return carImages[key] ?? heroAtmosphere;
}