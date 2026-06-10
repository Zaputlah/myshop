const fallbackProducts = [
    {
        id: 1,
        name: "Motion Runner",
        description: "Sepatu ringan dengan bantalan empuk untuk aktivitas harian.",
        price: 89,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85",
        image_title: "Red running shoes"
    },
    {
        id: 2,
        name: "Transit Backpack",
        description: "Tas ringkas dengan kompartemen praktis untuk kerja dan perjalanan.",
        price: 74,
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85",
        image_title: "Everyday backpack"
    },
    {
        id: 3,
        name: "Core Hoodie",
        description: "Lapisan hangat berbahan lembut dengan potongan santai.",
        price: 64,
        image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=85",
        image_title: "Classic hoodie"
    },
    {
        id: 4,
        name: "Studio Tee",
        description: "Kaos katun yang ringan, bersih, dan mudah dipadukan.",
        price: 29,
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85",
        image_title: "Essential t-shirt"
    },
    {
        id: 5,
        name: "Trail Low",
        description: "Sneaker serbaguna dengan traksi baik untuk langkah yang lebih jauh.",
        price: 98,
        image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=900&q=85",
        image_title: "Trail sneakers"
    },
    {
        id: 6,
        name: "Weekender Bag",
        description: "Tas akhir pekan berkapasitas lega dengan detail minimal.",
        price: 119,
        image: "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=900&q=85",
        image_title: "Black weekender bag"
    }
];

function loadSavedCart() {
    try {
        return JSON.parse(localStorage.getItem("hplus-cart")) || [];
    } catch (error) {
        return [];
    }
}

const app = Vue.createApp({
    data() {
        return {
            products: fallbackProducts,
            maximum: 200,
            search: "",
            sort: "featured",
            cart: loadSavedCart(),
            cartOpen: false,
            filterOpen: false,
            loading: true
        };
    },

    computed: {
        featuredProduct() {
            return this.products[0] || fallbackProducts[0];
        },

        filteredProducts() {
            const term = this.search.toLowerCase();
            const products = this.products.filter((product) => {
                const searchableText = `${product.name} ${product.description}`.toLowerCase();
                return Number(product.price) <= this.maximum && searchableText.includes(term);
            });

            if (this.sort === "low") {
                return products.sort((a, b) => Number(a.price) - Number(b.price));
            }

            if (this.sort === "high") {
                return products.sort((a, b) => Number(b.price) - Number(a.price));
            }

            return products;
        },

        priceRangeMax() {
            const highestPrice = Math.max(...this.products.map((product) => Number(product.price)), 200);
            return Math.ceil(highestPrice / 10) * 10;
        },

        cartQty() {
            return this.cart.reduce((total, product) => total + product.qty, 0);
        },

        cartTotal() {
            return this.cart.reduce((total, product) => total + Number(product.price) * product.qty, 0);
        }
    },

    watch: {
        cart: {
            deep: true,
            handler(cart) {
                localStorage.setItem("hplus-cart", JSON.stringify(cart));
            }
        },

        cartOpen(isOpen) {
            document.body.classList.toggle("drawer-open", isOpen);
        }
    },

    methods: {
        formatCurrency(value) {
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }).format(Number(value));
        },

        addToCart(product) {
            const existingProduct = this.cart.find((item) => item.id === product.id);

            if (existingProduct) {
                existingProduct.qty += 1;
            } else {
                this.cart.push({
                    id: product.id,
                    name: product.name,
                    price: Number(product.price),
                    image: product.image,
                    qty: 1
                });
            }

            this.cartOpen = true;
        },

        increaseQuantity(product) {
            product.qty += 1;
        },

        decreaseQuantity(product) {
            if (product.qty > 1) {
                product.qty -= 1;
                return;
            }

            this.removeFromCart(product);
        },

        removeFromCart(product) {
            this.cart = this.cart.filter((item) => item.id !== product.id);
        },

        resetFilters() {
            this.search = "";
            this.maximum = this.priceRangeMax;
            this.sort = "featured";
        },

        handleEscape(event) {
            if (event.key === "Escape") {
                this.cartOpen = false;
            }
        },

        normalizeProducts(products) {
            return products
                .filter((product) => product.name && product.image && !Number.isNaN(Number(product.price)))
                .map((product, index) => ({
                    ...product,
                    id: product.id || `api-${index}`,
                    price: Number(product.price)
                }));
        }
    },

    async mounted() {
        document.addEventListener("keydown", this.handleEscape);

        try {
            const response = await fetch("https://hplussport.com/api/products/order/price");

            if (!response.ok) {
                throw new Error(`Product API returned ${response.status}`);
            }

            const products = this.normalizeProducts(await response.json());

            if (products.length) {
                this.products = products;
                this.maximum = this.priceRangeMax;
            }
        } catch (error) {
            console.info("Using local product catalog:", error.message);
        } finally {
            this.loading = false;
        }
    },

    beforeUnmount() {
        document.removeEventListener("keydown", this.handleEscape);
        document.body.classList.remove("drawer-open");
    }
});

app.mount("#app");
