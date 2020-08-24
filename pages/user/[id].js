import { useRouter } from 'next/router'
export async function getServerSideProps() {
    const res = fetch('')
}

export default function User() {
    return (
        <div>
            <h1>Hi user {props.id} </h1>
        </div>
    )

}