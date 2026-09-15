import { Toaster } from 'sileo';

export default function SileoHost() {
  return (
    <Toaster
      position="top-right"
      options={{
        duration: 4200,
      }}
    />
  );
}
