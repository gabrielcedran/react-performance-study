type ProductItemProps = {
    product: {
        id: number;
        price: number;
        title: string;
    },
    onAddToWishList: (id: number) => void;
}

export function ProductItem({product, onAddToWishList}: ProductItemProps) {
    return (
        <div>
            {product.title} - <strong>{product.price}</strong>
            <button onClick={() => onAddToWishList(product.id)}>Add to wish list</button>
        </div>
    )
}