import HeroPanel from "@/components/layouts/HeroPanel";
import LoginForm from "@/components/forms/LoginForm";

export default function LoginPage() {
  return (
    <div className="w-full flex justify-center items-center py-4">
      {/* Authentication Layout Container */}
      <div
        className="flex flex-col lg:flex-row bg-white rounded-xl overflow-hidden shadow-2xl relative"
        style={{
          width: "1216px",
          maxWidth: "100%",
          minHeight: "640px",
          boxShadow:
            "0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 8px 10px -6px rgba(0, 0, 0, 0.1)",
          borderRadius: "12px",
        }}
      >
        {/* Left Column: Hero Context */}
        <div className="hidden lg:block flex-shrink-0">
          <HeroPanel />
        </div>

        {/* Right Column: Authentication Desk */}
        <div className="flex-1 flex justify-center items-center">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
