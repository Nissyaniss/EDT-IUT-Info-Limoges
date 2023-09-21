import { type APIEvent, json } from "solid-start/api";
import * as IUT from "edt-iut-info-limoges";

export const GET = async ({ params }: APIEvent) => {
  const year = params.year as IUT.YEARS;

  if (Object.values(IUT.YEARS).indexOf(year) === -1) {
    return json({
      success: false,
      message: "Invalid year."
    }, { status: 400 });
  }

  const entry = await IUT.getLatestTimetableEntry(year);
  const timetable = await entry.getTimetable();

  return json({
    success: true,
    data: timetable
  });
}