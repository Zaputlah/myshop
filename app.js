const app = Vue.createApp({
    data() {
        return {
            products: [],
            maximum: 50,
            cart: [],
            style: {
                label: ['font-weight-bold', 'mr-2'],
                inputWid: 60,
                sliderStatus: false
            }
        };
    },
    filter: {
        currencyFormat: function (value) {
            // Mengganti simbol "$" dengan "Rp" dalam format mata uang
            return '$ ' + Number.parseFloat(value).toFixed(2);
        },
        currencySymbol: function (value) {
            // Mengganti simbol "$" dengan "Rp"
            return '$ ' + value;
        }
    },
    computed: {
        filteredProducts() {
            return this.products.filter(product => product.price <= this.maximum);
        },
        sliderState: function () {
            return this.style.sliderStatus ? 'd-flex' : 'd-none';
        }, cartQty() {
            return this.cart.reduce((total, product) => total + product.qty, 0);
        },
        cartTotal() {
            return this.cart.reduce((total, product) => total + (product.price * product.qty), 0);
        }, uniqueCartItemQty() {
            // Menghitung jumlah item yang unik dalam keranjang
            const uniqueItems = new Set(this.cart.map(product => product.id));
            return uniqueItems.size;
        },
    },

    methods: {
        addToCart(product) {
            const existingProduct = this.cart.find(item => item.id === product.id);

            if (existingProduct) {
                // Produk sudah ada dalam keranjang, tingkatkan jumlah
                existingProduct.qty++;
            } else {
                // Produk belum ada dalam keranjang, tambahkan ke keranjang
                this.cart.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    qty: 1,
                    totalPrice: product.price // Total harga awal jika produk baru
                });
            }
        },

        decreaseQuantity(product) {
            const existingProductIndex = this.cart.findIndex(item => item.id === product.id);

            if (existingProductIndex !== -1) {
                if (this.cart[existingProductIndex].qty > 1) {
                    // Kurangi jumlah item jika lebih dari 1
                    this.cart[existingProductIndex].qty--;
                } else {
                    // Hapus item dari keranjang jika jumlahnya 1
                    this.cart.splice(existingProductIndex, 1);
                }
            }
        }
    },


    mounted() {
        // Lakukan permintaan HTTP GET ke API
        fetch('https://hplussport.com/api/products/order/price')
            .then(response => response.json())
            .then(data => {
                this.products = data.map(product => {
                    // Menambahkan format harga dengan dua angka di belakang koma
                    product.priceFormatted = parseFloat(product.price).toFixed(2);
                    return product;
                });
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }
});

app.mount('#app');
