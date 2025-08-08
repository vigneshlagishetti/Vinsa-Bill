# 🏪 Vinsa Bill - Complete Business Management Solution

**Made by Lagishetti Vignesh**

A comprehensive billing and inventory management application built with Next.js, designed to help businesses streamline their operations from inventory tracking to customer management.

## 🚀 Features

### Core Features
- **Smart Inventory Management**: Track 2M+ preloaded FMCG products with barcode scanning
- **GST-Compliant Billing**: Generate professional invoices with automatic tax calculations
- **Customer & Supplier Management**: Comprehensive CRM with history tracking
- **Point of Sale System**: Fast billing with barcode scanning and payment processing
- **Business Analytics**: Detailed reports on sales, profit, and performance
- **Multi-Device Access**: Cloud-based with mobile and desktop support

### Technology Features
- **Modern UI/UX**: Animated interface with smooth transitions
- **Real-time Updates**: Live inventory and sales data
- **Subscription Management**: Multi-tier pricing for different business needs
- **Role-based Access**: Admin, business owner, and staff permissions
- **Data Export**: PDF invoices and Excel reports
- **Cloud Sync**: Access data from anywhere

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Authentication**: NextAuth.js
- **Database**: Prisma with PostgreSQL
- **Payments**: Stripe integration
- **Charts**: Recharts for analytics
- **Icons**: Heroicons
- **Forms**: React Hook Form with Zod validation

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main application dashboard
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # Reusable React components
│   └── DashboardLayout.tsx
├── lib/                   # Utility functions and configurations
├── types/                 # TypeScript type definitions
└── hooks/                 # Custom React hooks
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/billing-fast.git
   cd billing-fast
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/billing_fast"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   
   # Stripe
   STRIPE_PUBLISHABLE_KEY="pk_test_..."
   STRIPE_SECRET_KEY="sk_test_..."
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Usage

### For Business Owners
1. **Sign up** for a new account
2. **Choose your subscription plan** based on business needs
3. **Set up your business profile** and preferences
4. **Import or add products** to your inventory
5. **Start billing** customers and managing sales

### For Staff Users
1. **Log in** with provided credentials
2. **Access assigned features** based on role permissions
3. **Process sales** and manage customer interactions
4. **Generate reports** as needed

## 📊 Subscription Plans

### Starter (₹999/month)
- Up to 1,000 products
- 5 users
- Basic reporting
- Email support
- Mobile app access

### Professional (₹2,499/month)
- Up to 10,000 products  
- 15 users
- Advanced reporting
- Priority support
- Multi-location support
- API access

### Enterprise (₹4,999/month)
- Unlimited products
- Unlimited users
- Custom reporting
- 24/7 support
- White-label solution
- Custom integrations

## 🛡️ Security

- JWT-based authentication
- Role-based access control
- Data encryption at rest and in transit
- Regular security updates
- GDPR compliance ready

## 📱 Mobile App

The mobile version provides:
- Barcode scanning for quick product entry
- Offline capability for basic operations
- Push notifications for important updates
- Touch-optimized interface for easy use

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- 📧 Email: vigneshlagishetti789@gmail.com
- 🐛 Bug Reports: Create an issue on GitHub

## 🗺️ Roadmap

- [ ] Advanced inventory forecasting
- [ ] Multi-currency support  
- [ ] Integration with popular e-commerce platforms
- [ ] AI-powered business insights
- [ ] Voice-activated billing
- [ ] Advanced warehouse management

---

Made with ❤️ for small and medium businesses across India
