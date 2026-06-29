"use client";

import { motion, type HTMLMotionProps, type Transition } from "framer-motion";

const pageTransition: Transition = {
  duration: 0.28,
  ease: [0.22, 1, 0.36, 1],
};

export function AdminPageMotion({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
}

export function AdminCardMotion({
  children,
  className,
  ...props
}: HTMLMotionProps<"div">) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={pageTransition}
      whileHover={{ y: -2 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
