# 🚀 تحسينات سريعة - Quick Fixes

## 1️⃣ تفعيل Validation في Backend

### الملف: `server-nestjs/src/main.ts`

**قبل:**
```typescript
// Temporarily disabled ValidationPipe due to class-transformer dependency
// app.useGlobalPipes(new ValidationPipe({
//   whitelist: true,
//   forbidNonWhitelisted: true,
//   transform: true,
// }));
```

**بعد:**
```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  transformOptions: {
    enableImplicitConversion: true,
  },
}));
```

---

## 2️⃣ إضافة Rate Limiting

### الملف: `server-nestjs/src/main.ts`

```typescript
import rateLimit from 'express-rate-limit';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Rate Limiting
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 دقيقة
      max: 100, // حد أقصى 100 طلب لكل IP
      message: 'تم تجاوز الحد الأقصى للطلبات، يرجى المحاولة لاحقاً',
      standardHeaders: true,
      legacyHeaders: false,
    })
  );
  
  // باقي الكود...
}
```

**تثبيت:**
```bash
cd server-nestjs
npm install express-rate-limit
```

---

## 3️⃣ إضافة Error Boundary

### ملف جديد: `src/components/GlobalErrorBoundary.tsx`

```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    // يمكن إرسال الخطأ إلى Sentry هنا
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-10 w-10 text-destructive" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">عذراً، حدث خطأ غير متوقع</h1>
              <p className="text-muted-foreground">
                نعتذر عن الإزعاج. يرجى المحاولة مرة أخرى أو الاتصال بالدعم الفني.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-muted p-4 rounded-lg text-left">
                <p className="text-xs font-mono text-destructive">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <Button onClick={this.handleReset} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                إعادة المحاولة
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                العودة للرئيسية
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### تحديث: `src/App.tsx`

```typescript
import { GlobalErrorBoundary } from '@/components/GlobalErrorBoundary';

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ClinicProvider>
        <GlobalErrorBoundary>
          <Toaster />
          <Sonner />
          <HashRouter>
            <ScrollToTop />
            <Routes>
              {/* Routes */}
            </Routes>
          </HashRouter>
        </GlobalErrorBoundary>
      </ClinicProvider>
    </TooltipProvider>
  </QueryClientProvider>
);
```

---

## 4️⃣ إضافة Code Splitting

### تحديث: `src/App.tsx`

```typescript
import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Lazy Loading للصفحات
const Index = lazy(() => import('./pages/Index'));
const Auth = lazy(() => import('./pages/Auth'));
const Admin = lazy(() => import('./pages/Admin'));
const Profile = lazy(() => import('./pages/Profile'));
const Plans = lazy(() => import('./pages/Plans'));
const QueueDisplay = lazy(() => import('./pages/QueueDisplay'));

// Loading Component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">جاري التحميل...</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ClinicProvider>
        <GlobalErrorBoundary>
          <Toaster />
          <Sonner />
          <HashRouter>
            <ScrollToTop />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/plans" element={<Plans />} />
                <Route path="/queue" element={<QueueDisplay />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </HashRouter>
        </GlobalErrorBoundary>
      </ClinicProvider>
    </TooltipProvider>
  </QueryClientProvider>
);
```

---

## 5️⃣ إضافة Sentry للـ Error Tracking

### تثبيت:
```bash
npm install @sentry/react @sentry/tracing
```

### ملف جديد: `src/lib/sentry.ts`

```typescript
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

export const initSentry = () => {
  if (import.meta.env.PROD) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [
        new BrowserTracing(),
        new Sentry.Replay({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      tracesSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      environment: import.meta.env.MODE,
    });
  }
};
```

### تحديث: `src/main.tsx`

```typescript
import { initSentry } from './lib/sentry';

// Initialize Sentry
initSentry();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### تحديث: `.env`

```env
VITE_SENTRY_DSN=your-sentry-dsn-here
```

---

## 6️⃣ تحسين معالجة الأخطاء في API

### ملف جديد: `src/lib/error-handler.ts`

```typescript
import { toast } from 'sonner';
import * as Sentry from '@sentry/react';

export const handleApiError = (error: any, customMessage?: string) => {
  // Log to Sentry
  if (import.meta.env.PROD) {
    Sentry.captureException(error);
  }

  // Log to console in development
  if (import.meta.env.DEV) {
    console.error('API Error:', error);
  }

  // Show user-friendly message
  const message = customMessage || 
    error?.response?.data?.message || 
    error?.message || 
    'حدث خطأ غير متوقع';

  toast.error(message, {
    description: import.meta.env.DEV ? error?.toString() : undefined,
  });
};
```

### استخدام:

```typescript
// قبل
try {
  await appointmentsApi.getStats();
} catch (error) {
  console.error('Error fetching dashboard data:', error);
}

// بعد
import { handleApiError } from '@/lib/error-handler';

try {
  await appointmentsApi.getStats();
} catch (error) {
  handleApiError(error, 'فشل في تحميل إحصائيات لوحة التحكم');
}
```

---

## 7️⃣ إضافة Loading States

### ملف جديد: `src/components/LoadingSpinner.tsx`

```typescript
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const LoadingSpinner = ({ 
  size = 'md', 
  text,
  className 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  );
};
```

### استخدام:

```typescript
{isDashboardLoading ? (
  <LoadingSpinner size="lg" text="جاري تحميل البيانات..." />
) : (
  <DashboardContent />
)}
```

---

## 8️⃣ إضافة Environment Variables Example

### ملف جديد: `.env.example`

```env
# Frontend Environment Variables
VITE_API_URL=/api
VITE_API_BASE_URL=/api
VITE_GEMINI_API_KEY=your-gemini-api-key-here
VITE_SENTRY_DSN=your-sentry-dsn-here

# Note: Never commit your actual .env file to Git!
# Copy this file to .env and fill in your actual values
```

### ملف جديد: `server-nestjs/.env.example`

```env
# Database
DIRECT_URL=postgresql://user:password@host:5432/database
DATABASE_URL=postgresql://user:password@host:6543/database?pgbouncer=true&connection_limit=5

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here

# Server
PORT=3000

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-key-here

# Note: Never commit your actual .env file to Git!
# Copy this file to .env and fill in your actual values
```

---

## 9️⃣ تحسين Performance مع React.memo

### مثال: `src/components/PatientCard.tsx`

```typescript
import { memo } from 'react';

// قبل
export const PatientCard = ({ id, name, phone, ... }: PatientCardProps) => {
  // Component logic
};

// بعد
export const PatientCard = memo(({ 
  id, 
  name, 
  phone, 
  ... 
}: PatientCardProps) => {
  // Component logic
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.id === nextProps.id && 
         prevProps.name === nextProps.name &&
         prevProps.phone === nextProps.phone;
});

PatientCard.displayName = 'PatientCard';
```

---

## 🔟 إضافة Git Hooks مع Husky

### تثبيت:
```bash
npm install --save-dev husky lint-staged
npx husky install
```

### ملف جديد: `.husky/pre-commit`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

### تحديث: `package.json`

```json
{
  "scripts": {
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

---

## 📊 قياس الأداء

### ملف جديد: `src/lib/performance.ts`

```typescript
export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  
  if (import.meta.env.DEV) {
    console.log(`⚡ ${name}: ${(end - start).toFixed(2)}ms`);
  }
};

export const reportWebVitals = (metric: any) => {
  if (import.meta.env.PROD) {
    // Send to analytics
    console.log(metric);
  }
};
```

---

## ✅ Checklist للتطبيق السريع

- [ ] تفعيل ValidationPipe
- [ ] إضافة Rate Limiting
- [ ] إضافة Error Boundary
- [ ] إضافة Code Splitting
- [ ] إضافة Sentry
- [ ] تحسين معالجة الأخطاء
- [ ] إضافة Loading States
- [ ] إنشاء .env.example
- [ ] إضافة React.memo
- [ ] إضافة Husky

---

**وقت التطبيق المتوقع:** 2-3 ساعات  
**التأثير:** تحسين كبير في الأداء والأمان والاستقرار
