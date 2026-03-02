import {error} from "@sveltejs/kit";

export const load = ({ url }) => {
  throw error(500, 'Internal Server Error');
}