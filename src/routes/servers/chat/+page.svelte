<script>
  import {error} from "@sveltejs/kit";

  export function load({ url }) {
    if (url.searchParams.get('error') === '500') {
      throw error(500, 'Internal Server Error');
    }
  }
</script>