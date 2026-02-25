export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://msyblaohdkpztytpbszp.supabase.co/rest/v1/events?select=*",
      {
        headers: {
          apikey: process.env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`
        }
      }
    );

    const data = await response.json();
    res.status(200).json(data);

  } catch (err) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
}