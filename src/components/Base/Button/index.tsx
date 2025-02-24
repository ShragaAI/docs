import clsx from "clsx";
import styles from "./styles.module.css";
import Link from "@docusaurus/Link";

type ButtonProps = {
  to: string;
  children: React.ReactNode;
  variant?: "filled" | "outlined"; 
  Icon?: React.ComponentType<React.ComponentProps<"svg">>;  
};
 
const buttonVariants = {
  filled: styles.buttonFilled,
  outlined: styles.buttonOutlined,
};

export default function Button({ to, children, variant = "filled", Icon }: ButtonProps) {
  return (
    <Link to={to} className={clsx(styles.button, buttonVariants[variant])}>
      {Icon && <Icon className={styles.buttonIcon} role="img" />}
      {children}
    </Link>
  );
}
