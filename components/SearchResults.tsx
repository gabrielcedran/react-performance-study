import { memo } from "react";
import { ProductItem } from "./ProductItem";

type SearchResultsProps = {
    results: Array<{
        id: number;
        price: number;
        title: string;
    }>

}

function SearchResultsComponent({results}: SearchResultsProps) {
    return (
        <div>
            {results.map(product => {
                return (
                    <ProductItem key={product.id} product={product}/>
                );
            })}
        </div>
    )
}

export const SearchResults = memo(SearchResultsComponent, (prevProps, nextProps) => {
    return Object.is(prevProps.results, nextProps.results);
});
