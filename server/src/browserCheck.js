export function ensureServerEnvironment(functionName) {
  if (typeof window !== 'undefined') {
    throw new Error(
      `${functionName} can only be used in a server-side context (getStaticProps, getServerSideProps, API routes). See documentation for proper usage.`
    );
  }
} 