export function Footer() {
  return (
    <footer className="border-t">
      <div className="container flex-col-reverse items-center justify-between gap-4 py-10 sm:h-24 sm:flex-row sm:py-0">
        <p className="text-center text-sm leading-loose text-muted-foreground">
          © {new Date().getFullYear()} GrocerEase. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
