import { type PropsWithChildren } from "react";

const AppLayout = ({ children }: Readonly<PropsWithChildren>) => {
  return (
    <div className="relative">
      <main>
        {children}
      </main>
    </div>
  )
};

export default AppLayout;