export interface CatalogoLibro {
  uuid: string;
  title: string;
  author: string;
  available: boolean;
  numPages: number | null;
  pubDate: string | null;
  description: string | null;
}
