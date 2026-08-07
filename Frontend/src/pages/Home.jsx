import {Link} from 'react-router-dom';

export default function Home() {

    return (
        <div className='bg:slate-750, m-10'>
        <div className="text-center, mt-5 text-3xl, text:amber-500">
            <h1>County_Service_Tracker </h1>
            <p>Easier,faster and transparent county services</p>
        </div>

        <div>
            <h2 className='text-white, text-xl, m-10'>Welcome citizens</h2>
            <p>Apply and manage government services online</p>

            <div className='flex, justify-center, m-10'>
                <Link to="login" className='bg:amber-500, text-white, p-2, rounded-md'>
                Login / 
                </Link>

                <Link to="register" className='bg:amber-500, text-white, p-2, rounded-md'>
                Register
                </Link>


            </div>
        </div>
        </div>
    );

}