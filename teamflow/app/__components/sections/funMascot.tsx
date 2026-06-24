type FunMascotProps = {
    className?: string;
  };
  
  export default function FunMascot({ className }: FunMascotProps) {
    return (
      <div className={["tf-mascot", className].filter(Boolean).join(" ")} aria-hidden="true">
        <div className="tf-mascot-body" aria-hidden="true">
          <span className="tf-mascot-eye tf-mascot-eye--left" />
          <span className="tf-mascot-eye tf-mascot-eye--right" />
          <span className="tf-mascot-mouth" />
          <span className="tf-mascot-cheek tf-mascot-cheek--left" />
          <span className="tf-mascot-cheek tf-mascot-cheek--right" />
        </div>
      </div>
    );
  }
  