# ReWear – Community Clothing Exchange

A modern web platform that enables users to exchange unused clothing through direct swaps or a point-based redemption system, promoting sustainable fashion and reducing textile waste.

# Team members
Kabilash S - kabilash0108@gmail.com 
<br>
Amit manoranjan udayar- amitmanoranjan2905@gmail.com
<br>
N S Dheepak Shakthi - nsdshakthi@gmail.com
<br>
Julian Aaron Raj - julianaaron1970@gmail.com
##  Features

### User Features
- **User Authentication**: Secure email/password login and registration with JWT tokens
- **Dashboard**: Personal profile with points balance and item management
- **Item Listing**: Upload and manage clothing items with detailed descriptions
- **Swap System**: Direct item exchanges between users
- **Points System**: Earn and redeem points for clothing items (100 welcome points)
- **Browse & Search**: Discover items by category, size, condition, and more
- **Responsive Design**: Optimized for mobile, tablet, and desktop

### Admin Features
- **Content Moderation**: Review and approve/reject item listings
- **User Management**: Monitor user activity and handle disputes
- **Analytics Dashboard**: Track platform usage and popular items

## 🛠 Technology Stack

- **Framework**: Next.js 15+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + ShadCN UI Components
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based authentication with bcrypt
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Development**: ESLint, Prettier (configured)

## Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn package manager

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Julian-Idl/ReWear.git
   cd rewear
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Database (replace with your PostgreSQL credentials)
   DATABASE_URL="postgresql://username:password@localhost:5432/rewear_db"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-super-secret-jwt-signing-key-here"
   ```

4. **Set up the database**:
   ```bash
   # Create database 
   createdb rewear_db
   
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   ```

5. **Run the development server**:
   ```bash
   npm run dev
   ```

6. **Open the application**:
   Visit [http://localhost:3000](http://localhost:3000) in your browser.


## Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with sample data
npm run db:reset     # Reset database and reseed
```


## Security Features

- JWT-based authentication with secure token signing
- Password hashing using bcrypt (12 rounds)
- Input validation with Zod schemas
- SQL injection protection via Prisma ORM
- Environment variable security
- Rate limiting (planned)

## UI/UX Features

- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Theme switching support (planned)
- **Accessibility**: WCAG 2.1 compliant components
- **Modern UI**: Clean, intuitive interface with ShadCN components
- **Fast Loading**: Optimized images and assets

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

### Docker (Alternative)

```bash
# Build Docker image
docker build -t rewear .

# Run container
docker run -p 3000:3000 rewear
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgments

- [Next.js](https://nextjs.org) for the amazing React framework
- [Prisma](https://prisma.io) for the excellent database toolkit
- [ShadCN/UI](https://ui.shadcn.com) for beautiful UI components
- [Tailwind CSS](https://tailwindcss.com) for utility-first styling
- [Lucide](https://lucide.dev) for the icon library

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.

---

