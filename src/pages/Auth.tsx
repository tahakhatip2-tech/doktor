import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toastWithSound } from '@/lib/toast-with-sound';
import { Loader2 } from "lucide-react";
import { authSchema } from "@/lib/validations";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate with Zod
      const validationData = isLogin
        ? { email, password }
        : { email, password, name: fullName, phone };

      const validation = authSchema.safeParse(validationData);

      if (!validation.success) {
        toastWithSound.error(validation.error.errors[0].message);
        setIsLoading(false);
        return;
      }

      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.includes("Invalid credentials") || error.includes("401")) {
            toastWithSound.error("البرظٹد الإلظƒطھرظˆنظٹ أظˆ ظƒلمة المرظˆر ط؛ظٹر صحظٹحة");
          } else {
            toastWithSound.error(error);
          }
        } else {
          toastWithSound.success("طھم طھسجظٹل الدخظˆل بنجاح");
          navigate("/");
        }
      } else {
        const { error } = await signUp(email, password, fullName, phone);
        if (error) {
          if (error.includes("already exists") || error.includes("400")) {
            toastWithSound.error("هذا البرظٹد الإلظƒطھرظˆنظٹ مسجل مسبقاً");
          } else {
            toastWithSound.error(error);
          }
        } else {
          // Set flag for new user to trigger onboarding tutorial
          localStorage.setItem('isNewUser', 'true');
          toastWithSound.success("طھم إنشاط، الحساب بنجاح");
          navigate("/");
        }
      }
    } catch (error) {
      toastWithSound.error("حدث خطأ ط؛ظٹر مطھظˆقع");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen h-screen bg-background flex flex-col relative overflow-hidden" dir="rtl">
      {/* Autofill Fix & Selection Style */}
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
            -webkit-background-clip: text;
            -webkit-text-fill-color: #ffffff !important;
            transition: background-color 5000s ease-in-out 0s;
            box-shadow: inset 0 0 20px 20px transparent !important;
        }
        ::selection {
          background-color: rgba(249, 115, 22, 0.3);
          color: white;
        }
      `}</style>

      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 resize-bg-animation transform scale-105"
        style={{ backgroundImage: 'url(/auth-bg-pro.png?v=6)' }}
      >
        {/* Modern "Sharp" Overlay Removed for Clarity */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      {/* Content Container - Compact & Centered */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center w-full px-4 lg:px-20 relative z-10 gap-6 lg:gap-24 h-full">

        {/* Right Side: Login Form - Compressed for Mobile */}
        <div className="w-full lg:w-auto flex flex-col items-center justify-center h-full lg:h-auto max-h-screen py-2">
          {/* Card: Sharp Blue Glass */}
          <Card className="w-full max-w-md p-6 lg:p-8 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.3)] bg-blue-950/20 backdrop-blur-xl animate-fade-in-up hover:bg-blue-900/30 transition-all duration-500 rounded-none group/card relative overflow-hidden flex flex-col justify-center h-auto max-h-full">

            {/* Ambient Glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl pointer-events-none group-hover/card:bg-blue-500/30 transition-colors"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl pointer-events-none group-hover/card:bg-orange-500/20 transition-colors"></div>

            <div className="flex flex-col items-center justify-center gap-2 mb-3 relative z-10">
              {/* Logo - Compressed for Mobile - Height 20 -> 16 to save space */}
              <div className="relative group/logo cursor-pointer transform scale-90 transition-transform">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-orange-500 rounded-full blur-lg opacity-40 animate-pulse"></div>
                <img
                  src="/hakeem-logo.png"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; }}
                  alt="Doctor Jo Logo"
                  className="h-16 w-16 object-cover rounded-full drop-shadow-2xl relative z-10 transition-transform hover:scale-110 duration-500 border-2 border-white/10 bg-blue-950/30"
                />
              </div>

              <div className="text-center space-y-0.5">
                <h1 className="text-xl lg:text-3xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-blue-700 to-orange-500 bg-clip-text text-transparent drop-shadow-md">
                  Doctor Jo
                </h1>
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-blue-300/80">
                  Clinic Management System
                </p>
              </div>
            </div>

            <h2 className="text-xs lg:text-base font-black text-center mb-3 text-white uppercase tracking-wider flex items-center justify-center gap-3 opacity-90">
              <span className="h-px w-6 bg-gradient-to-l from-white/20 to-transparent"></span>
              {isLogin ? "طھسجظٹل الدخظˆل" : "إنشاط، حساب جدظٹد"}
              <span className="h-px w-6 bg-gradient-to-r from-white/20 to-transparent"></span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-2 w-full">
              {!isLogin && (
                <>
                  <div className="space-y-1">
                    <Label htmlFor="fullName" className="text-blue-200/80 text-[10px] font-bold uppercase tracking-wide">الاسم الظƒامل</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="أدخل اسمظƒ الظƒامل"
                      className="!bg-transparent border border-orange-500/50 focus:border-orange-400 focus:ring-0 text-white placeholder:text-blue-200/20 rounded-none h-9 text-sm transition-all text-right"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="phone" className="text-blue-200/80 text-[10px] font-bold uppercase tracking-wide">رقم الهاطھظپ</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0791234567"
                      required={!isLogin}
                      className="!bg-transparent border border-orange-500/50 focus:border-orange-400 focus:ring-0 text-white placeholder:text-blue-200/20 rounded-none h-9 text-sm transition-all font-mono text-left direction-ltr"
                    />
                  </div>
                </>
              )}

              <div className="space-y-1">
                <Label htmlFor="email" className="text-blue-200/80 text-[10px] font-bold uppercase tracking-wide">البرظٹد الإلظƒطھرظˆنظٹ</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="!bg-transparent border border-orange-500/50 focus:border-orange-400 focus:ring-0 text-white placeholder:text-blue-200/20 rounded-none h-9 text-sm transition-all font-mono text-left direction-ltr"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="password" className="text-blue-200/80 text-[10px] font-bold uppercase tracking-wide">ظƒلمة المرظˆر</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                  required
                  className="!bg-transparent border border-orange-500/50 focus:border-orange-400 focus:ring-0 text-white placeholder:text-blue-200/20 rounded-none h-9 text-sm transition-all font-mono tracking-widest text-left"
                />
              </div>

              <Button
                type="submit"
                className="w-full mt-2 bg-transparent border border-orange-500 hover:bg-orange-500/10 text-orange-500 font-bold h-9 rounded-none shadow-[0_0_20px_rgba(249,115,22,0.1)] hover:shadow-[0_0_30px_rgba(249,115,22,0.2)] transition-all duration-300 text-xs uppercase tracking-wider relative overflow-hidden group/btn"
                disabled={isLoading}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></span>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="animate-pulse">جارظٹ المعالجة...</span>
                  </div>
                ) : (
                  isLogin ? "دخظˆل للنظام" : "إنشاط، حساب"
                )}
              </Button>
            </form>

            <div className="w-full mt-2 space-y-2">
              {/* Unified Auth Button - New Improved Experience */}
              <Button
                type="button"
                onClick={() => navigate('/unified-auth')}
                className="w-full bg-transparent border border-blue-500 hover:bg-blue-500/10 text-blue-500 font-bold h-9 rounded-none shadow-[0_0_20px_rgba(59,130,246,0.1)] hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] transition-all duration-300 text-xs uppercase tracking-wider relative overflow-hidden group/portal"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/portal:translate-x-[100%] transition-transform duration-700"></span>
                طھسجظٹل دخظˆل مظˆحد âœ¨
              </Button>

              <div className="text-center">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-[10px] text-blue-300 hover:text-white transition-colors font-medium border-b border-dashed border-blue-500/30 hover:border-blue-400 pb-0.5"
                >
                  {isLogin
                    ? "مسطھخدم جدظٹدطں إنشاط، حساب"
                    : "لدظٹظƒ حسابطں طھسجظٹل الدخظˆل"}
                </button>
              </div>
            </div>

            {/* Mobile Vision & Footer (Inside Card - COMPRESSED) */}
            <div className="lg:hidden mt-3 pt-2 border-t border-white/10 flex flex-col items-center gap-1.5 animate-fade-in-up w-full">
              {/* Vision Text - Compact */}
              <div className="text-center w-full px-2">
                <p className="text-[8px] font-bold leading-tight text-white/80 w-full mx-auto">
                  "أظˆل نظام <span className="text-blue-400">ذظƒظٹ</span> لإدارة العظٹاداطھطŒ بسظƒرطھظٹر آلظٹ."
                </p>
              </div>

              {/* Footer Line - High Visibility */}
              <div className="w-full text-center pb-1 space-y-0.5">
                <p className="text-[8px] text-blue-300/60 font-medium whitespace-nowrap">
                  طھم برمجة المظˆقع بظˆاسطة الخطظٹب للبرمجظٹاطھ
                </p>
                <p className="text-[8px] text-orange-500/80 font-mono font-bold uppercase tracking-widest whitespace-nowrap">
                  Doctor Jo â€¢ Version 1.0
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Left Side: Modern Vision Panel (Desktop Only) */}
        <div className="hidden lg:flex w-full lg:w-1/2 flex-col justify-center items-start text-white p-8 animate-fade-in-up delay-200 pl-20">
          <div className="relative group/vision">

            {/* Artistic Side Line */}
            <div className="absolute -right-8 top-0 w-1 h-32 bg-gradient-to-b from-blue-500 to-transparent shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>

            <div className="space-y-6">
              <h3 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-blue-100 to-blue-900/20 tracking-tighter leading-none opacity-20 absolute -top-16 -right-20 select-none pointer-events-none">
                VISION
              </h3>

              <div className="relative">
                <h3 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                  <span className="text-orange-500">رؤظٹطھنا</span>
                  <span className="h-px w-12 bg-blue-500/50"></span>
                </h3>
              </div>

              <p className="text-3xl font-black leading-tight text-white max-w-2xl drop-shadow-2xl">
                "أظˆل نظام <span className="text-blue-400">ذظƒظٹ</span> ظپظٹ الشرق الأظˆسط لإدارة العظٹاداطھ ظˆطھطظˆظٹر النظام الصحظٹ العامطŒ مدعظˆم <span className="text-orange-500">بسظƒرطھظٹر آلظٹ</span> مطھظƒامل."
              </p>

              <div className="flex flex-wrap gap-3 pt-4">
                {['الاظˆل عربظٹاً', 'طھحظˆل رقمظٹ', 'ذظƒاط، اصطناعظٹ'].map((tag) => (
                  <span key={tag} className="px-4 py-1.5 bg-blue-500/10 border border-blue-400/20 text-xs text-blue-200 font-bold backdrop-blur-sm rounded-none hover:bg-blue-500/20 transition-colors cursor-default">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Al-Khatib Signature (From Footer) */}
              <div className="pt-12 mt-12 border-t border-white/5">
                <div className="flex flex-col gap-1 opacity-80 group-hover/vision:opacity-100 transition-opacity">
                  <h3 className="text-sm font-black tracking-widest bg-gradient-to-r from-blue-400 via-orange-400 to-blue-400 bg-clip-text text-transparent">
                    AL-KHATIB-MARKETING&SOFTWARE
                  </h3>
                  <p className="text-[10px] text-blue-300/50 uppercase tracking-[0.2em] font-bold">Premium Digital Solutions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer minimal (Desktop) */}
      <div className="hidden lg:block absolute bottom-6 left-0 right-0 z-10 text-center pointer-events-none space-y-1">
        <p className="text-[11px] text-blue-200/40 font-medium drop-shadow-md">طھم برمجة المظˆقع بظˆاسطة الخطظٹب للبرمجظٹاطھ</p>
        <p className="text-[10px] text-blue-200/20 font-mono tracking-[0.5em] uppercase">Secure Access Portal â€¢ Doctor Jo v1.0</p>
      </div>
    </div>
  );
};

export default Auth;
