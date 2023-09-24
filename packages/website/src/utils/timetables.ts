import localforage from "localforage";
import type { ITimetable, ApiTimetable } from "~/types/api";

const timetable_store = (year: number) => localforage.createInstance({
  name: "timetables",
  storeName: "A" + year
});

interface TimetableStore {
  data: ITimetable
  // last_update: number
  last_fetch: number
}

/**
 * Get the latest week number stored in the local database.
 */
export const getLatestStoredTimetable = async (year: number): Promise<TimetableStore | null> => {
  const timetables = await timetable_store(year).keys();
  const latest_stored = timetables.reduce((acc, cur) => {
    if (acc.length === 0) return cur;

    const acc_date = parseInt(acc);
    const cur_date = parseInt(cur);
    
    if (cur_date > acc_date) return cur;
    return acc;
  }, "");

  if (latest_stored.length === 0) return null;
  const timetable = await timetable_store(year).getItem(latest_stored) as TimetableStore;
  return timetable;
}

/**
 * @see <https://stackoverflow.com/a/6117889>
 * @param d - The date we want to take the week number from. 
 * @returns - The week number of the given date.
 */
const getWeekNumber = (d: Date) => {
  // Copy date so don't modify original
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
  // Get first day of year
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  // Calculate full weeks to nearest Thursday
  const weekNo = Math.ceil((
    (
      (d.getTime() - yearStart.getTime()) / 86400000
    ) + 1
  ) / 7);

  return weekNo;
};

export const listTimetablesOnline = async (year: number) => {
  const response = await fetch("/api/list/A" + year);
  const json = await response.json();

  return json as {
    success: boolean,
    data: {
      file_name: string
      last_updated: string
      week_number: number
      from_year: string
      link: string
    }[]
  };
}

export const getTimetableFor = async (day: Date, year: number): Promise<ITimetable> => {
  const year_str = "A" + year;

  const week_number_in_year = getWeekNumber(day);
  const stored_timetable = await timetable_store(year).getItem(week_number_in_year.toString()) as TimetableStore | null;
  if (stored_timetable) {
    // console.log("Timetable found in local database!")
    return stored_timetable.data;
  }

  const fetchFromDiff = async (diff_header: ITimetable["header"]) => {
    // get the difference between the last stored week and the current week
    const diff = week_number_in_year - diff_header.week_number_in_year;
    // get the week_number to request
    const week_number_to_request = diff_header.week_number + diff;

    const timetable_response = await fetch("/api/" + year_str + "/" + week_number_to_request);
    // console.log("Timetable fetched **from latest** since we're online!", {
    //   day: week_number_to_request, diff_header, diff
    // });
    if (timetable_response.status === 404) {
      throw new Error("Timetable doesn't exist, yet!");
    }

    const { data: timetable } = await timetable_response.json() as ApiTimetable;
    await timetable_store(year).setItem<TimetableStore>(timetable.header.week_number_in_year.toString(), {
      last_fetch: Date.now(),
      data: timetable
    });

    return timetable;
  }

  const lastStoredWeek = await getLatestStoredTimetable(year);
  // if we have a last stored, check if it's superior or equal to the current week number
  if (lastStoredWeek !== null) {
    // if we're online
    try {
      const timetable = await fetchFromDiff(lastStoredWeek.data.header);
      return timetable; 
    }
    catch (error) {
      if (error instanceof Error && error.message === "Timetable doesn't exist, yet!") {
        throw error;
      }
      
      throw new Error("Unable to fetch the timetable: offline and no cache");
    }
  }
 
  // if we're online, get the latest.
  try {
    const latest_timetable_response = await fetch("/api/latest/" + year_str);
    const { data: latest_timetable } = await latest_timetable_response.json() as ApiTimetable;
    await timetable_store(year).setItem<TimetableStore>(latest_timetable.header.week_number_in_year.toString(), {
      last_fetch: Date.now(),
      data: latest_timetable
    });
  
    const timetable = await fetchFromDiff(latest_timetable.header);
    return timetable;
  }
  catch (error) {
    if (error instanceof Error && error.message === "Timetable doesn't exist, yet!") {
      throw error;
    }

    throw new Error("Unable to fetch the timetable: offline and no cache");
  }
};
