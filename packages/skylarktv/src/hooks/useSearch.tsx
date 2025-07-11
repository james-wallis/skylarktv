import { useQuery } from "@tanstack/react-query";
import {
  SkylarkSet,
  Brand,
  Episode,
  Movie,
  Person,
  SearchResultListing,
  SkylarkTVSupportedSetType,
  GQLError,
  LiveStream,
  Article,
} from "../types";
import { SEARCH } from "../graphql/queries";
import { skylarkRequestWithDimensions } from "../lib/utils";
import { useDimensions } from "../contexts";
import { Dimensions } from "../lib/interfaces";

interface SearchResult extends Omit<SearchResultListing, "objects"> {
  objects: (
    | SkylarkSet
    | Brand
    | Episode
    | Movie
    | Person
    | LiveStream
    | Article
  )[];
}

const fetcher = (query: string, dimensions: Dimensions) =>
  skylarkRequestWithDimensions<{ search: SearchResult }>(SEARCH, dimensions, {
    query,
  }).then(({ search: data }): SearchResult => data);

const select = (data: SearchResult): SearchResult => {
  // Filter SkylarkSet results to only collections (as SkylarkTV only has pages for collections)
  // TODO remove after the type filtering has been added to search (SL-2665)
  const objects = data?.objects.filter(
    (obj) =>
      obj.__typename !== "SkylarkSet" ||
      obj.type === SkylarkTVSupportedSetType.Collection,
  );

  return {
    ...data,
    objects,
  };
};

export const useSearch = (query: string) => {
  const { dimensions, isLoadingDimensions } = useDimensions();

  const { data, error, isLoading } = useQuery<
    SearchResult,
    GQLError,
    SearchResult
  >({
    queryKey: ["Search", query, dimensions],
    queryFn: () => fetcher(query, dimensions),
    enabled: Boolean(query && !isLoadingDimensions),
    select,
  });

  return {
    data,
    isLoading,
    isError: error,
  };
};
